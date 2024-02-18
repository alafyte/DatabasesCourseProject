const Restaurant = require("../models/restaurant");
const {main_menu, auth_menu} = require("../utils/menus");
const Product = require("../models/product");
const contact = async (req, res) => {
    try {
        let restaurants = await Restaurant.getAll();

        res.render('contact', {
            title: 'Контакты',
            main_menu: main_menu,
            auth_menu: auth_menu,
            tab_selected: 3,
            restaurants: restaurants,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении ресторанов"}]})
    }
};

const map = (req, res) => {
    res.render('map', {
        title: 'Карта ресторанов',
        main_menu: main_menu,
        auth_menu: auth_menu,
        tab_selected: 3,
        user_signed_in: !!req.cookies.token,
    })
}

const getIndex = async (req, res) => {
    try {
        let page = req.query.page ? req.query.page : 1;

        if (!parseInt(page, 10)) {
            page = 1;
        } else {
            page = parseInt(page, 10);
        }

        const paginator = await Product.getProductsByPage(page, 8);

        res.render('index', {
            title: 'Главная',
            main_menu: main_menu,
            auth_menu: auth_menu,
            tab_selected: 1,
            paginator: paginator,
            user_signed_in: !!req.cookies.token,
        });
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении товаров"}]})
    }
}

const about = (req, res) => {
    res.render('about_us', {
        title: 'О нас',
        main_menu: main_menu,
        auth_menu: auth_menu,
        tab_selected: 2,
        user_signed_in: !!req.cookies.token,
    })
}

const forClient = (req, res) => {
    res.render('for_client', {
        title: 'Клиенту',
        main_menu: main_menu,
        auth_menu: auth_menu,
        tab_selected: 4,
        user_signed_in: !!req.cookies.token,
    })
}

exports.contact = contact;
exports.map = map;
exports.about = about;
exports.getIndex = getIndex;
exports.forClient = forClient;