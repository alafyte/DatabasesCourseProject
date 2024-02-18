const {main_menu, auth_menu, admin_menu} = require("../utils/menus");
const Product = require("../models/product");
const path = require("path");
const {upload_path} = require("../upload");
const {validationResult} = require("express-validator");

const getAll = async (req, res) => {
    try {
        let page = req.query.page ? req.query.page : 1;

        if (!parseInt(page, 10)) {
            page = 1;
        } else {
            page = parseInt(page, 10);
        }

        const paginator = await Product.getProductsByPage(page, 8);


        res.render('admin_menu', {
            title: 'Администрирование | Меню',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: admin_menu,
            tab_selected: 0,
            paginator: paginator,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении товаров"}]})
    }
}

const getCreationForm = (req, res) => {

    res.render('menu_add', {
        title: 'Добавление товара',
        main_menu: main_menu,
        auth_menu: auth_menu,
        admin_menu: admin_menu,
        tab_selected: 0,
        user_signed_in: !!req.cookies.token,
    })
}

const getChangeForm = async (req, res) => {
    try {
        let id = req.params['productId'];

        if (!parseInt(id, 10)) {
            return res.status(422).json({error: "Неверный идентификатор товара"})
        }
        id = parseInt(id, 10);

        let product = await Product.getOne(id);

        res.render('menu_change', {
            title: 'Изменение товара',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: admin_menu,
            product: product,
            tab_selected: 0,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении товара"}]})
    }
}

const createNewProduct = (req, res) => {
    try {
        const errors = validationResult(req);

        if (req.file === undefined) {
            return res.status(422).json({error: [{msg: "Добавьте изображение товара"}]});
        }
        if (req.file.filename.length < 0 || req.file.filename.length > 50) {
            return res.status(422).json({error: [{msg: "Имя изображения не должно превышать 40 символов"}]})
        }
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }
        const new_data = {
            item_name: req.body.item_name,
            price: req.body.price,
            description: req.body.description,
            item_image: path.join(upload_path, req.file.filename)
        }

        Product.createNewProduct(new_data)
            .then(() => res.status(200).json({message: "success"}))
            .catch(() => res.status(422).json({error: [{msg: "Ошибка при добавлении товара"}]}));
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при добавлении товара"}]})
    }
}

const changeProduct = (req, res) => {
    try {
        let id = req.params['productId'];

        if (!parseInt(id, 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор товара"}]})
        }
        id = parseInt(id, 10);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }

        let image_data = null;
        if (req.file !== undefined) {
            if (req.file.filename.length < 0 || req.file.filename.length > 50)
                return res.status(422).json({error: [{msg: "Имя изображения не должно превышать 40 символов"}]})
            else
                image_data = path.join(upload_path, req.file.filename);
        }


        const new_data = {
            item_name: req.body.item_name,
            small_size_price: req.body.price,
            description: req.body.description,
            item_image: image_data
        }

        Product.changeProduct(id, new_data)
            .then(() => res.status(200).json({message: "success"}))
            .catch(() => res.status(422).json({error: [{msg: "Ошибка при обновлении товара"}]}));
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при обновлении товара"}]})
    }
}

const deleteProduct = (req, res) => {
    let id = req.params['productId'];

    if (!parseInt(id, 10)) {
        return res.status(422).json({error: [{msg: "Неверный идентификатор товара"}]})
    }
    id = parseInt(id, 10);

    Product.deleteOne(id).then(() => res.status(200).json({message: "success"}))
        .catch(() => res.status(422).json({error: [{msg: "Ошибка при удалении товара"}]}));
}

const getProductDetails = async (req, res) => {
    try {
        let id = req.params['productId'];

        if (!parseInt(id, 10)) {
            return res.status(422).json({error: "Неверный идентификатор товара"})
        }
        id = parseInt(id, 10);
        let product = await Product.getOne(id);
        const sizes = await Product.getSizes();
        let prices = await Product.getPrices();
        prices = JSON.stringify(prices);

        res.render('product_details', {
            title: product.ITEM_NAME,
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: admin_menu,
            product: product,
            sizes: sizes,
            prices: prices,
            current_size_option: 1,
            tab_selected: 0,
            user_signed_in: !!req.cookies.token,
        })
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении информации о товаре"}]})
    }
}

exports.getAll = getAll;
exports.getCreationForm = getCreationForm;
exports.getChangeForm = getChangeForm;
exports.createNewProduct = createNewProduct;
exports.changeProduct = changeProduct;
exports.deleteProduct = deleteProduct;
exports.getProductDetails = getProductDetails;
