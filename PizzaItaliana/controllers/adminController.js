const {main_menu, auth_menu, admin_menu, getRestaurantAdminMenu} = require("../utils/menus");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const {validationResult} = require("express-validator");

const getAdminPanel = (req, res) => {
    res.render('admin_index', {
        title: 'Администрирование',
        main_menu: main_menu,
        auth_menu: auth_menu,
        admin_menu: admin_menu,
        tab_selected: 0,
        user_signed_in: !!req.cookies.token,
    });
};

const getRestaurantAdminPanel = async (req, res) => {

    res.render('admin_index', {
        title: 'Администрирование',
        main_menu: main_menu,
        auth_menu: auth_menu,
        admin_menu: getRestaurantAdminMenu(req.session.restaurant_id),
        tab_selected: 0,
        user_signed_in: !!req.cookies.token,
    });
}

const createNewRestAdmin = async (req, res) => {
    try {
        if (req.body.password !== req.body.repeat_password) {
            return res.status(422).json({error: [{msg: "Пароли не совпадают"}]})
        }
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }

        const hashPassword = bcrypt.hashSync(req.body.password, 7);

        let admin_data = {
            full_name: req.body.full_name,
            email: req.body.email,
            phone_num: req.body.phone_number,
            date_of_birth: req.body.date_of_birth,
            password: hashPassword
        }

        await User.registerAdmin(admin_data);

        return res.status(200).json({message: "success"});
    } catch (err) {
        const errors = [
            "unique constraint (HEAD_ADMIN.SYS_C007450)",
            "unique constraint (HEAD_ADMIN.SYS_C007451)"
        ]
        let message = "Ошибка при регистрации администратора"
        if (err.message.includes(errors[0])) {
            message = "Пользователь с таким Email уже существует"
        } else if (err.message.includes(errors[1])) {
            message = "Пользователь с таким номером телефона уже существует"
        }
        return res.status(422).json({error: [{msg: message}]})
    }
};

const getRestaurantAdministrators = async (req, res) => {
    try {
        const admins = await User.getAdminRest();

        res.render('administrators', {
            title: 'Администраторы ресторанов',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: admin_menu,
            tab_selected: 0,
            admins: admins,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении администраторов"}]})
    }
}

const getAdminAddForm = (req, res) => {
    res.render('administrators_add', {
        title: 'Администраторы ресторанов',
        main_menu: main_menu,
        auth_menu: auth_menu,
        admin_menu: admin_menu,
        tab_selected: 0,
        user_signed_in: !!req.cookies.token,
    })
}

exports.getAdminPanel = getAdminPanel;
exports.createNewRestAdmin = createNewRestAdmin;
exports.getRestaurantAdministrators = getRestaurantAdministrators;
exports.getAdminAddForm = getAdminAddForm;
exports.getRestaurantAdminPanel = getRestaurantAdminPanel;