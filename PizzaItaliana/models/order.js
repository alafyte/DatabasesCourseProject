const database = require('./database').DB;

module.exports = class Order {

    static async getOrdersByUser(user_id) {
        let res = await database.executeQuery("BEGIN USER_PACKAGE.DELETE_ORPHAN_USER_ORDERS(); END;");
        let result = await database.executeQueryWithParams(`select * from TABLE(USER_PACKAGE.GET_ORDERS_BY_USER(:user_id))`, {
            user_id: user_id
        });
        return result.rows;
    }

    static async getOrdersByRestaurant(rest_id) {
        let result = await database.executeQueryWithParams(`select * from TABLE(REST_ADMIN_PACKAGE.GET_ORDERS_BY_RESTAURANT(:rest_id))`, {
            rest_id: rest_id
        });
        return result.rows;
    }

    static async getItemsByOrder (order_id) {
        let result = await database.connection.execute(`select * from TABLE(USER_PACKAGE.GET_ITEMS_BY_ORDER(:order_id))`, {
            order_id: order_id
        });
        return result.rows;
    }

    static async createOrder (new_data) {
        let query = `BEGIN
        USER_PACKAGE.MOVE_CART_ITEMS_TO_ORDER(
        p_user_latitude => :p_user_latitude, 
        p_user_longitude => :p_user_longitude,
        p_user_id => :p_user_id,
        p_address => :p_address,
        p_cart_id => :p_cart_id);
        END;`;

        return database.executeQueryWithParams(query, {
            p_user_latitude: new_data.user_latitude,
            p_user_longitude: new_data.user_longitude,
            p_user_id: new_data.user_id,
            p_address: new_data.address,
            p_cart_id: new_data.cart_id
        });
    }
}