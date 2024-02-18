const oracledb = require('oracledb');
const {getCurrentCredentials} = require("../config");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


class DB {
    constructor() {
        let credentials = getCurrentCredentials();

        oracledb.getConnection({
            user: credentials.user,
            password: credentials.password,
            connectString: "localhost/RESTAURANT_PDB"
        }).then((connection) => {
            this.connection = connection;
        });
    }

    executeQuery = async (query) => {
        return await this.connection.execute(query);
    }

    executeQueryWithParams = async (query, params) => {
        return await this.connection.execute(query, params);
    }


    closeConnection = async () => {
        await this.connection.close();
    }
}

exports.DB = new DB();