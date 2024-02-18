const Restaurant = require("../models/restaurant");
const {main_menu, auth_menu, admin_menu, getRestaurantAdminMenu} = require("../utils/menus");
const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");
const {validationResult} = require("express-validator");
const getAll = async (req, res) => {
    try {
        let restaurants = await Restaurant.getAll();

        res.render('admin_restaurants', {
            title: 'Администрирование | Рестораны',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: admin_menu,
            tab_selected: 0,
            restaurants: restaurants,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении ресторанов"}]})
    }
};

const getChangeForm = async (req, res) => {
    try {
        let id = req.params['restaurantId'];
        if (!parseInt(id, 10)) {
            return res.status(422).json({error: "Неверный идентификатор ресторана"})
        }
        id = parseInt(id, 10);

        let restaurant = await Restaurant.getOne(id);
        let current_admin = await User.getAdminById(restaurant.RESTAURANT_ADMIN);
        let admins = await User.getUnassignedAdmins();

        res.render('restaurant_change', {
            title: 'Изменение ресторана',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: admin_menu,
            tab_selected: 0,
            restaurant: restaurant,
            current_admin: current_admin,
            admins: admins,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при обновлении ресторана"}]})
    }
};


const getCreationForm = async (req, res) => {
    try {
        let admins = await User.getUnassignedAdmins();

        res.render('restaurant_add', {
            title: 'Добавление ресторана',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: admin_menu,
            admins: admins,
            tab_selected: 0,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при добавлении ресторана"}]})
    }
};

const getRestaurantByAdmin = async (req, res) => {
    try {
        let id = req.params['restaurantId'];
        if (!parseInt(id, 10)) {
            return res.status(422).json({error: "Неверный идентификатор товара"})
        }
        id = parseInt(id, 10);
        const rest = await Restaurant.getOne(id);

        let orders = await Order.getOrdersByRestaurant(rest.ID);

        for (let order of orders) {
            order.items = await Order.getItemsByOrder(order.ID);
            let result_price = 0;
            for (let item of order.items) {
                let product = await Product.getOne(item.MENU_ITEM_ID);
                item.product = product;
                result_price += product.SMALL_SIZE_PRICE * item.MARKUP * item.ITEM_QUANTITY;
            }
            order.result_price = result_price.toFixed(2);
        }

        res.render('restaurant_by_admin', {
            title: 'Администрирование | Ресторан',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: getRestaurantAdminMenu(rest.ID),
            restaurant: rest,
            orders: orders,
            tab_selected: 0,
            user_signed_in: !!req.cookies.token,
        });
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении ресторана"}]})
    }
}

const createNewRestaurant = (req, res) => {
    try {
        const errors = validationResult(req);

        if (req.file === undefined) {
            return res.status(422).json({error: [{msg: "Добавьте область доставки"}]})
        }
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }
        const coverage_area = req.file;
        let coverage_area_data = JSON.parse(coverage_area.buffer.toString('utf-8'));
        coverage_area_data = coverage_area_data.features[0].geometry;
        if (coverage_area_data.type !== 'Polygon') {
            throw new Error('Invalid coverage area geometry')
        }
        coverage_area_data = JSON.stringify(coverage_area_data);

        let location_data = `{\"type\": \"Point\", \"coordinates\": [ ${req.body.longitude}, ${req.body.latitude} ]}`;
        const admin_id = parseInt(req.body.admins, 10);

        Restaurant.createNewRestaurant({
            address: req.body.address,
            location: location_data,
            coverage_area: coverage_area_data,
            restaurant_admin: admin_id,
            open_time: req.body.open_time,
            close_time: req.body.close_time,
            delivery_start_time: req.body.delivery_start_time,
            delivery_end_time: req.body.delivery_end_time,
        })
            .then(() => res.status(200).json({message: "success"}))
            .catch((err) => {
                const errors = [
                    "Зона доставки пересекается с зоной доставки другого ресторана",
                    "Местоположение ресторана не находится в зоне доставки"
                ]
                if (err.message.includes(errors[0])) {
                    return res.status(422).json({error: [{msg: errors[0]}]})
                } else if (err.message.includes(errors[1])) {
                    return res.status(422).json({error: [{msg: errors[1]}]})
                }
                return res.status(422).json({error: [{msg: "Ошибка при добавлении ресторана"}]})
            });
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при добавлении ресторана"}]})
    }
};


const changeRest = (req, res) => {
    try {
        const errors = validationResult(req);
        let id = req.params['restaurantId'];

        if (!parseInt(id, 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор ресторана"}]})
        }
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }
        id = parseInt(id, 10);

        let location_data = `{\"type\": \"Point\", \"coordinates\": [ ${req.body.longitude}, ${req.body.latitude} ]}`;
        let coverage_area_data = null;
        if (req.file !== undefined) {
            const coverage_area = req.file;
            coverage_area_data = JSON.parse(coverage_area.buffer.toString('utf-8'));
            coverage_area_data = coverage_area_data.features[0].geometry;
            if (coverage_area_data.type !== 'Polygon') {
                throw new Error('Invalid coverage area geometry')
            }
            coverage_area_data = JSON.stringify(coverage_area_data);
        }

        Restaurant.changeRestaurant(id, {
            address: req.body.address !== undefined ? req.body.address : null,
            location: location_data,
            coverage_area: coverage_area_data,
            open_time: req.body.open_time !== undefined ? req.body.open_time : null,
            close_time: req.body.close_time !== undefined ? req.body.close_time : null,
            admin: req.body.admins,
            delivery_start_time: req.body.delivery_start_time !== undefined ? req.body.delivery_start_time : null,
            delivery_end_time: req.body.delivery_end_time !== undefined ? req.body.delivery_end_time : null,
        })
            .then(() => res.status(200).json({message: "success"}))
            .catch((err) => {
                const errors = [
                    "Зона доставки пересекается с зоной доставки другого ресторана",
                    "Местоположение ресторана не находится в зоне доставки"
                ]
                if (err.message.includes(errors[0])) {
                    return res.status(422).json({error: [{msg: errors[0]}]})
                } else if (err.message.includes(errors[1])) {
                    return res.status(422).json({error: [{msg: errors[1]}]})
                }
                return res.status(422).json({error: [{msg: "Ошибка при изменении ресторана"}]})
            });
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при обновлении ресторана"}]})
    }
};

const deleteRestaurant = (req, res) => {
    let id = req.params['restaurantId'];

    if (!parseInt(id, 10)) {
        return res.status(422).json({error: [{msg: "Неверный идентификатор ресторана"}]})
    }
    id = parseInt(id, 10);

    Restaurant.deleteOne(id).then(() => res.status(200).json({message: "success"}))
        .catch(() => res.status(422).json({error: [{msg: "Ошибка при удалении ресторана"}]}));

};

const findRestaurant = async (req, res) => {
    try {
        let result = await Restaurant.findNearest(req.body.latitude, req.body.longitude);

        return res.status(200).json({message: `Ближайший к вам ресторан находится по адресу ${result}`})
    } catch (err) {
        return res.status(422).json({error: "Ошибка при поиске ресторана"})
    }

}

exports.getAll = getAll;
exports.getChangeForm = getChangeForm;
exports.changeRest = changeRest;
exports.deleteRestaurant = deleteRestaurant;
exports.getCreationForm = getCreationForm;
exports.createNewRestaurant = createNewRestaurant;
exports.getRestaurantByAdmin = getRestaurantByAdmin;
exports.findRestaurant = findRestaurant;