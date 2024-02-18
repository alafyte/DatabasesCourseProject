const {main_menu, auth_menu} = require("../utils/menus");
const registration = (req, res) => {
    res.render('registration', {
        title: 'Регистрация',
        main_menu: main_menu,
        auth_menu: auth_menu,
        tab_selected: 6,
        user_signed_in: !!req.cookies.token,
    });
}

const login = (req, res) => {
    res.render('login', {
        title: 'Войти',
        main_menu: main_menu,
        auth_menu: auth_menu,
        tab_selected: 5,
        user_signed_in: !!req.cookies.token,
    });
}

exports.registration = registration;
exports.login = login;