const database = require('./database').DB;

module.exports = class Product {
    constructor(id, item_name, small_size_price, description, item_image) {
        this.ID = id;
        this.ITEM_NAME = item_name;
        this.SMALL_SIZE_PRICE = small_size_price;
        this.DESCRIPTION = description;
        this.ITEM_IMAGE = item_image;
    }

    static async getSizes() {

        let result = await database.executeQuery('SELECT ID, ITEM_SIZE from HEAD_ADMIN.GET_PRICES');
        return result.rows;
    }

    static async getPrices() {

        let result = await database.executeQuery('SELECT ID, MARKUP from HEAD_ADMIN.GET_PRICES');
        return result.rows;
    }


    static async getPagesCount(pageSize) {
        let result = await database.executeQueryWithParams(
            'SELECT CEIL(COUNT(*) / :pageSize) PAGES_COUNT from HEAD_ADMIN.GET_PRODUCTS',
            {
                pageSize: pageSize
            }
        );
        return result.rows[0].PAGES_COUNT;
    }

    static async getProductsByPage(pageNumber, pageSize) {
        let result = await database.executeQueryWithParams(
            `SELECT * FROM TABLE(USER_PACKAGE.GET_MENU_ITEMS_PAGE(:p_page_number, :p_page_size))`,
            {
                p_page_number: pageNumber,
                p_page_size: pageSize
            }
        );

        let pagesCount = await this.getPagesCount(pageSize);

        let hasOtherPages = pagesCount !== 1;
        let hasNext = +pageNumber !== pagesCount;
        let nextPageNumber = hasNext ? +pageNumber + 1 : 0;
        let hasPrevious = +pageNumber !== 1;
        let previousPageNumber = hasPrevious ? +pageNumber - 1 : 0;

        let pageRange = []

        for (let i = 1; i <= pagesCount; i++) {
            pageRange.push(i);
        }

        return {
            products: result.rows,
            pagesCount: pagesCount,
            currentPage: +pageNumber,
            hasOtherPages: hasOtherPages,
            hasNext: hasNext,
            nextPageNumber: nextPageNumber,
            hasPrevious: hasPrevious,
            previousPageNumber: previousPageNumber,
            pageRange: pageRange
        };
    }

    static async createNewProduct(new_data) {

        let query = `BEGIN
        HEAD_ADMIN_PACKAGE.INSERT_MENU_ITEM(
        p_item_name => :p_item_name, 
        p_small_size_price => :p_small_size_price, 
        p_description => :p_description, 
        p_item_image => :p_item_image);
        END;`;

        return database.executeQueryWithParams(query, {
            p_item_name: new_data.item_name,
            p_small_size_price: new_data.price,
            p_description: new_data.description,
            p_item_image: new_data.item_image,
        });
    }

    static async changeProduct(id, new_data) {

        let bindVals = {
            p_id: id,
            p_item_name: new_data.item_name,
            p_small_size_price: new_data.small_size_price,
            p_description: new_data.description,
        }

        let image_query;

        if (new_data.item_image !== null) {
            image_query = 'p_item_image => :p_item_image,';
            bindVals.p_item_image = new_data.item_image;
        } else {
            image_query = '';
        }

        let query = `BEGIN
        HEAD_ADMIN_PACKAGE.UPDATE_MENU(
        p_id => :p_id, 
        p_item_name => :p_item_name, 
        p_small_size_price => :p_small_size_price, 
        ${image_query}
        p_description => :p_description 
        );
        END;`;

        return database.executeQueryWithParams(query, bindVals);
    }

    static async getOne(id) {
        let result = await database.executeQueryWithParams(`select * from TABLE(USER_PACKAGE.GET_PRODUCT_BY_ID(:prod_id))`, {
            prod_id: id
        });
        return result.rows[0];
    }

    static async deleteOne(id) {
        return database.executeQueryWithParams(`BEGIN
        HEAD_ADMIN_PACKAGE.DELETE_PRODUCT(:p_id);
        END;`, {
            p_id: id
        })
    }

}