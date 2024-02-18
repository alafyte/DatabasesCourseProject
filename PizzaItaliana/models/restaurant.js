const fs = require("fs");
const path = require("path");
const oracledb = require("oracledb");
const database = require('./database').DB;

const dir_file = path.join(process.cwd(), 'data_dir', 'data.json');

module.exports = class Restaurant {
    constructor(id, address, location, coverage_area, restaurant_admin, open_time, close_time, delivery_start_time, delivery_end_time) {
        this.ID = id;
        this.ADDRESS = address;
        this.LOCATION = location;
        this.COVERAGE_AREA = coverage_area;
        this.RESTAURANT_ADMIN = restaurant_admin;
        this.OPEN_TIME = open_time;
        this.CLOSE_TIME = close_time;
        this.DELIVERY_START_TIME = delivery_start_time;
        this.DELIVERY_END_TIME = delivery_end_time;
    }

    static async findNearest(userLatitude, userLongitude) {
        const bindParams = {
            p_user_latitude: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: userLatitude },
            p_user_longitude: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: userLongitude },
            p_nearest_restaurant: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 }
        };

        let result = await database.executeQueryWithParams(
            'BEGIN USER_PACKAGE.FIND_NEAREST_RESTAURANT(:p_user_latitude, :p_user_longitude, :p_nearest_restaurant); END;',
            bindParams
        );

        return result.outBinds.p_nearest_restaurant;
    }

    static async changeRestaurant(id, new_data) {

        let bindVals = {
            p_id: id,
            p_address: new_data.address,
            p_open_time: new_data.open_time,
            p_close_time: new_data.close_time,
            p_admin: new_data.admin,
            p_delivery_start_time: new_data.delivery_start_time,
            p_delivery_end_time: new_data.delivery_end_time
        }

        let location_query;
        let area_query;


        if (new_data.location !== null) {
            location_query = 'p_location => sdo_util.from_geojson(:p_location),';
            bindVals.p_location = new_data.location;
        } else {
            location_query = '';
        }
        if (new_data.coverage_area !== null) {
            area_query = 'p_coverage_area => sdo_util.from_geojson(:p_coverage_area),'
            bindVals.p_coverage_area = new_data.coverage_area;
        } else {
            area_query = '';
        }

        let query = `BEGIN
        HEAD_ADMIN_PACKAGE.UPDATE_RESTAURANT(
        p_id => :p_id, 
        p_address => :p_address, 
        ${location_query}
        ${area_query} 
        p_admin => :p_admin,
        p_open_time => TO_TIMESTAMP(:p_open_time, 'HH24:MI'), 
        p_close_time => TO_TIMESTAMP(:p_close_time, 'HH24:MI'), 
        p_delivery_start_time => TO_TIMESTAMP(:p_delivery_start_time, 'HH24:MI'), 
        p_delivery_end_time => TO_TIMESTAMP(:p_delivery_end_time, 'HH24:MI'));
        END;`;

        return database.executeQueryWithParams(query, bindVals);
    }

    static async createNewRestaurant(new_data) {
        let query = `BEGIN
        HEAD_ADMIN_PACKAGE.ADD_RESTAURANT(
        p_address => :p_address, 
        p_location => sdo_util.from_geojson(:p_location),
        p_coverage_area => sdo_util.from_geojson(:p_coverage_area),
        p_restaurant_admin => :p_restaurant_admin,
        p_open_time => TO_TIMESTAMP(:p_open_time, 'HH24:MI'), 
        p_close_time => TO_TIMESTAMP(:p_close_time, 'HH24:MI'), 
        p_delivery_start_time => TO_TIMESTAMP(:p_delivery_start_time, 'HH24:MI'), 
        p_delivery_end_time => TO_TIMESTAMP(:p_delivery_end_time, 'HH24:MI'));
        END;`;

        return database.executeQueryWithParams(query, {
            p_address: new_data.address,
            p_location: new_data.location,
            p_coverage_area: new_data.coverage_area,
            p_restaurant_admin: new_data.restaurant_admin,
            p_open_time: new_data.open_time,
            p_close_time: new_data.close_time,
            p_delivery_start_time: new_data.delivery_start_time,
            p_delivery_end_time: new_data.delivery_end_time
        });
    }

    static async deleteOne(id) {
        return database.executeQueryWithParams(`BEGIN
        HEAD_ADMIN_PACKAGE.DELETE_RESTAURANT(:p_id);
        END;`, {
            p_id: id
        })
    }

    static async getOne(id) {
        let result = await database.executeQueryWithParams(`select * from TABLE(REST_ADMIN_PACKAGE.get_restaurant_by_id(:rest_id))`, {
            rest_id: id
        });
        return result.rows[0];
    }

    static async getRestaurantByAdmin(admin_id) {
        let result = await database.executeQueryWithParams(`select * from TABLE(REST_ADMIN_PACKAGE.GET_RESTAURANT_BY_ADMIN(:admin_id))`, {
            admin_id: admin_id
        });
        return result.rows[0];
    }

    static async getAll() {
        let result = await database.executeQuery('SELECT * FROM HEAD_ADMIN.GET_RESTAURANTS_INFO');

        let feature_collection = {
            type: "FeatureCollection",
            features: []
        }

        let result_collection = [];

        let geoJsonData = "";
        for (let i = 0; i < result.rows.length; i++) {
            let feature_location = {
                type: 'Feature',
            }
            let lob = result.rows[i].LOCATION;
            if (lob) {
                geoJsonData = await lob.getData();
                feature_location.geometry = JSON.parse(geoJsonData);
                feature_collection.features.push(feature_location);
            } else {
                console.log('Нет данных GeoJSON');
            }
            let feature_area = {
                type: 'Feature',
            }
            lob = result.rows[i].COVERAGE_AREA;
            if (lob) {
                geoJsonData = await lob.getData();
                feature_area.geometry = JSON.parse(geoJsonData);
                feature_collection.features.push(feature_area);
            }

            result_collection.push({
                ID: result.rows[i].ID,
                ADDRESS: result.rows[i].ADDRESS,
                OPEN_TIME: result.rows[i].OPEN_TIME,
                CLOSE_TIME: result.rows[i].CLOSE_TIME,
                DELIVERY_START_TIME: result.rows[i].DELIVERY_START_TIME,
                DELIVERY_END_TIME: result.rows[i].DELIVERY_END_TIME,
                ADMIN: result.rows[i].ADMIN,
            })
        }
        await fs.writeFile(dir_file, JSON.stringify(feature_collection), (e) => {
            if (e) {
                console.log(e)
            }
        });


        return result_collection;
    }

}