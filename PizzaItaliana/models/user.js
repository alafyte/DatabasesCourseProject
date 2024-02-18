const database = require('./database').DB;

module.exports = class User {

    constructor(fullName, email, phoneNumber, dateOfBirth, roleName, password) {
        this.FULL_NAME = fullName;
        this.EMAIL = email;
        this.PHONE_NUMBER = phoneNumber;
        this.DATE_OF_BIRTH = dateOfBirth;
        this.ROLE_NAME = roleName;
        this.PASSWORD_HASH = password;
    }

    async save() {
        await database.executeQueryWithParams(`BEGIN
        USER_PACKAGE.register_user(:full_name, :email, :phone_num, :date_of_birth, :password);
        END;`, {
            full_name: this.FULL_NAME,
            email: this.EMAIL,
            phone_num: this.PHONE_NUMBER,
            date_of_birth: this.DATE_OF_BIRTH,
            password: this.PASSWORD_HASH
        })
    }

    static async registerAdmin(admin_data) {
        await database.executeQueryWithParams(`BEGIN
        HEAD_ADMIN_PACKAGE.register_restaurant_admin(full_name => :full_name, email => :email,
         phone_number => :phone_num, date_of_birth => :date_of_birth, password => :password);
        END;`, {
            full_name: admin_data.full_name,
            email: admin_data.email,
            phone_num: admin_data.phone_num,
            date_of_birth: admin_data.date_of_birth,
            password: admin_data.password
        })
    }

    static async getAll() {
        let result = await database.executeQuery('SELECT * FROM HEAD_ADMIN.GET_USERS');
        return result.rows;
    }

    static async getAdminRest() {
        let result = await database.executeQuery('SELECT * FROM HEAD_ADMIN.ADMIN_USERS');
        return result.rows;
    }

    static async getUnassignedAdmins() {
        let result = await database.executeQuery('SELECT * FROM HEAD_ADMIN.UNASSIGNED_ADMINS');
        return result.rows;
    }

    static async getAdminById(id) {
        let result = await database.executeQuery('SELECT * FROM HEAD_ADMIN.ADMIN_USERS WHERE id = ' + id);
        return result.rows[0];
    }
}