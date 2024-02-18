const database = require('./database').DB;

module.exports = class Courier {

    constructor(id, full_name, email, phone_number, date_of_birth, salary, active, readyToGo) {
        this.ID = id;
        this.FULL_NAME = full_name;
        this.EMAIL = email;
        this.PHONE_NUMBER = phone_number;
        this.DATE_OF_BIRTH = date_of_birth;
        this.SALARY = salary;
        this.ACTIVE = active;
        this.READY_TO_GO = readyToGo;
    }

    static async getCouriersByRestaurant(restId) {
        let result = await database.executeQueryWithParams(`select * from TABLE(REST_ADMIN_PACKAGE.GET_COURIER_BY_RESTAURANT(:restId))`, {
            restId: restId
        });
        return result.rows;
    }

    static async getOne(id) {
        let result = await database.executeQueryWithParams(`select * from TABLE(REST_ADMIN_PACKAGE.GET_COURIER_BY_ID(:courier_id))`, {
            courier_id: id
        });
        return result.rows[0];
    }

    static async changeCourier(id, new_data) {
        let query = `BEGIN
        REST_ADMIN_PACKAGE.UPDATE_COURIER_AND_PERSONAL_DATA(
        p_id => :p_id,
        p_full_name => :p_full_name, 
        p_email => :p_email, 
        p_phone_number => :p_phone_number, 
        p_date_of_birth => :p_date_of_birth, 
        p_salary => :p_salary, 
        p_active => :p_active,
        p_ready_to_go => :p_ready_to_go
        );
        END;`;

        return database.executeQueryWithParams(query, {
            p_id: id,
            p_full_name: new_data.full_name,
            p_email: new_data.email,
            p_phone_number: new_data.phone_number,
            p_date_of_birth: new_data.date_of_birth,
            p_salary: new_data.salary,
            p_active: new_data.active,
            p_ready_to_go: new_data.ready_to_go
        });
    }

    static async deleteOne(id) {
        return database.executeQueryWithParams(`BEGIN
        REST_ADMIN_PACKAGE.DELETE_COURIER(:p_id);
        END;`, {
            p_id: id
        })
    }

    static async createNewCourier(new_data) {
        let query = `BEGIN
        REST_ADMIN_PACKAGE.INSERT_COURIER(full_name => :p_full_name, 
        email => :p_email, 
        phone_number => :p_phone_number, 
        date_of_birth => :p_date_of_birth, 
        salary => :p_salary, 
        restaurant => :p_restaurant
        );
        END;`;

        return database.executeQueryWithParams(query, {
            p_full_name: new_data.full_name,
            p_email: new_data.email,
            p_phone_number: new_data.phone_number,
            p_date_of_birth: new_data.date_of_birth,
            p_salary: new_data.salary,
            p_restaurant: new_data.restaurant,
        });
    }
}