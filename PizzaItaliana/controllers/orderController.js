const Cart = require("../models/cart");
const Order = require("../models/order");
const {main_menu, auth_menu} = require("../utils/menus");
const Product = require("../models/product");
const getUserOrders = async (req, res) => {
    try {
        let orders = await Order.getOrdersByUser(req.session.user.ID);

        for (let order of orders) {
            order.items = await Order.getItemsByOrder(order.ID);
            let result_price = 0;
            for (let item of order.items) {
                let product = await Product.getOne(item.MENU_ITEM_ID);
                item.product = product;
                item.CURRENT_PRICE = product.SMALL_SIZE_PRICE * item.MARKUP * item.ITEM_QUANTITY;
                result_price += item.CURRENT_PRICE;
                item.CURRENT_PRICE = item.CURRENT_PRICE.toFixed(2);
            }
            order.result_price = result_price.toFixed(2);
        }

        res.render('user_orders', {
            title: 'Корзина',
            main_menu: main_menu,
            auth_menu: auth_menu,
            tab_selected: 0,
            orders: orders,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении заказов"}]})
    }
}

const getOrderCreationPage = (req, res) => {
    res.render('make_order', {
        title: 'Заказ',
        main_menu: main_menu,
        auth_menu: auth_menu,
        tab_selected: 0,
        user_signed_in: !!req.cookies.token,
    });
}

const makeOrder = async (req, res) => {
    try {
    let cart = await Cart.getCartIdByUser(req.session.user.ID);

    let new_data = {
        user_latitude: req.body.latitude,
        user_longitude: req.body.longitude,
        user_id: req.session.user.ID,
        address: req.body.address,
        cart_id: cart
    }

    Order.createOrder(new_data)
        .then(() => res.status(200).json({message: "success"}))
        .catch((err) => {
            const messages = [
                "Пользователь вне области доставки",
                "Время заказа не входит в промежуток работы службы доставки",
                "no data found"
            ]
            let error_message = "Ошибка при оформлении заказа";
            if (err.message.includes(messages[0])) {
                error_message = "Указанный адрес не входит в область доставки"
            } else if (err.message.includes(messages[1])) {
                error_message = messages[1]
            } else if (err.message.includes(messages[2])) {
                error_message = "На данный момент сервис доставки перегружен. Повторите попытку позже"
            }
            return res.status(422).json({error: error_message})
        });
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при совершении заказа"}]})
    }
}

exports.getUserOrders = getUserOrders;
exports.makeOrder = makeOrder;
exports.getOrderCreationPage = getOrderCreationPage;