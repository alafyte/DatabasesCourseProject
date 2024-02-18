const {BIND_OUT, NUMBER} = require("oracledb");
const database = require('./database').DB;


module.exports = class Cart {
    static async getCartByUser(user_id) {
        let result = await database.connection.execute(`select * from TABLE(USER_PACKAGE.GET_CART_BY_USER_ID(:user_id))`, {
            user_id: user_id
        });

        return result.rows;
    }

    static async getCartIdByUser (user_id) {
        let result = await database.executeQueryWithParams(`BEGIN 
        :result := USER_PACKAGE.GET_CART_ID_BY_USER_ID(:user_id);
        END;`, {
            result: { dir: BIND_OUT, type: NUMBER },
            user_id: user_id
        });


        return result.outBinds.result;
    }

    static async addToCart(new_data) {

        let query = `BEGIN
        USER_PACKAGE.ADD_TO_CART(
        p_cart_id => :p_cart_id, 
        p_menu_item_id => :p_menu_item_id, 
        p_menu_item_size => :p_menu_item_size);
        END;`;

        return database.executeQueryWithParams(query, {
            p_cart_id: new_data.cart_id,
            p_menu_item_id: new_data.menu_item_id,
            p_menu_item_size: new_data.menu_item_size,
        });
    }

    static async changeQuantity(id, quantity) {
        let query = `BEGIN
        USER_PACKAGE.UPDATE_CART_ITEM_QUANTITY(
        p_cart_item_id => :p_cart_item_id, 
        p_new_quantity => :p_new_quantity);
        END;`;

        return database.executeQueryWithParams(query, {
            p_cart_item_id: id,
            p_new_quantity: quantity
        });
    }

    static async deleteItemFromCart(id) {

        return database.executeQueryWithParams(`BEGIN
        USER_PACKAGE.DELETE_ITEM_FROM_CART(:p_id);
        END;`, {
            p_id: id
        })
    }

    static async purgeCart(id) {

        return database.executeQueryWithParams(`BEGIN
        USER_PACKAGE.PURGE_CART(:p_id);
        END;`, {
            p_id: id
        })
    }
}