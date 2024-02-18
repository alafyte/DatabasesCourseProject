const Cart = require("../models/cart");
const {main_menu, auth_menu} = require("../utils/menus");
const Product = require("../models/product");

const getUserCartInfo = async (req, res) => {
    try {
        let cart_items = await Cart.getCartByUser(req.session.user.ID);
        let result_price = 0;
        for (let item of cart_items) {
            item.product = await Product.getOne(item.MENU_ITEM_ID);
            item.CURRENT_PRICE = String((item.product.SMALL_SIZE_PRICE * item.MARKUP * item.ITEM_QUANTITY).toFixed(2));
            result_price += +item.CURRENT_PRICE;
        }

        res.render('cart_info', {
            title: 'Корзина',
            main_menu: main_menu,
            auth_menu: auth_menu,
            tab_selected: 0,
            cart_items: cart_items,
            result_price: result_price.toFixed(2),
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении корзины"}]})
    }
}

const addToCart = async (req, res) => {
    try {
        let cart_id = await Cart.getCartIdByUser(req.session.user.ID);

        const new_data = {
            cart_id: cart_id,
            menu_item_id: req.body.item_id,
            menu_item_size: req.body.item_size,
        }

        Cart.addToCart(new_data)
            .then(() => res.status(200).json({message: "success"}))
            .catch(() => res.status(422).json({error: "Общее кол-во товаров в корзине не должно превышать 10 шт."}));
    } catch (err) {
        return res.status(500).json({error: "Ошибка добавлении товара"})
    }
}

const changeQuantity = (req, res) => {
    let id = req.params['itemId'];

    if (!parseInt(id, 10)) {
        res.status(422).json({error: "Неверный идентификатор товара"})
    }
    id = parseInt(id, 10);

    Cart.changeQuantity(id, req.body.count)
        .then(() => res.status(200).json({message: "success"}))
        .catch(() => res.status(422).json({error: "Общее кол-во товаров в корзине не должно превышать 10 шт."}));
}

const deleteItemFromCart = (req, res) => {
    let id = req.params['itemId'];

    if (!parseInt(id, 10)) {
        res.status(422).json({error: "Неверный идентификатор товара"})
    }
    id = parseInt(id, 10);

    Cart.deleteItemFromCart(id)
        .then(() => res.status(200).json({message: "success"}))
        .catch(() => res.status(422).json({error: "Ошибка при удалении товара из корзины"}));
}

const purgeCart = async (req, res) => {
    try {
        let id = await Cart.getCartIdByUser(req.session.user.ID);
        Cart.purgeCart(id)
            .then(() => res.status(200).json({message: "success"}))
            .catch(() => res.status(422).json({error: "Ошибка при очистке корзины"}));
    } catch (err) {
        return res.status(500).json({error: "Ошибка при очистке корзины"})
    }
}

exports.getUserCartInfo = getUserCartInfo;
exports.addToCart = addToCart;
exports.changeQuantity = changeQuantity;
exports.deleteItemFromCart = deleteItemFromCart;
exports.purgeCart = purgeCart;