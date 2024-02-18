const Courier = require("../models/courier");
const {main_menu, auth_menu, getRestaurantAdminMenu} = require("../utils/menus");
const {validationResult} = require("express-validator");

const getAll = async (req, res) => {
    try {
        let couriers = await Courier.getCouriersByRestaurant(parseInt(req.session.restaurant_id, 10));

        res.render('admin_couriers', {
            title: 'Администрирование | Курьеры',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: getRestaurantAdminMenu(req.session.restaurant_id),
            couriers: couriers,
            tab_selected: 0,
            user_signed_in: !!req.cookies.token,
        });
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении курьеров"}]})
    }
}

const getCreationForm = async (req, res) => {
    res.render('courier_add', {
        title: 'Добавление курьера',
        main_menu: main_menu,
        auth_menu: auth_menu,
        admin_menu: getRestaurantAdminMenu(req.session.restaurant_id),
        tab_selected: 0,
        user_signed_in: !!req.cookies.token,
    });
}

const getChangeForm = async (req, res) => {
    try {
        let id = req.params['courierId'];

        if (!parseInt(id, 10)) {
            return res.status(422).json({error: "Неверный идентификатор курьера"})
        }
        id = parseInt(id, 10);


        let courier = await Courier.getOne(id);

        res.render('courier_change', {
            title: 'Изменение курьера',
            main_menu: main_menu,
            auth_menu: auth_menu,
            admin_menu: getRestaurantAdminMenu(req.session.restaurant_id),
            tab_selected: 0,
            courier: courier,
            user_signed_in: !!req.cookies.token,
        });
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении курьера"}]})
    }
}

const createNewCourier = (req, res) => {

    if (!parseInt(req.session.restaurant_id, 10)) {
        return res.status(422).json({error: [{msg: "Неверный идентификатор курьера"}]})
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({error: errors.array()});
    }

    const rest_id = parseInt(req.session.restaurant_id, 10);

    let courier_data = {
        full_name: req.body.full_name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        date_of_birth: req.body.date_of_birth,
        salary: req.body.salary,
        restaurant: rest_id
    }

    Courier.createNewCourier(courier_data)
        .then(() => res.status(200).json({message: "success"}))
        .catch((err) => {
            const errors = [
                "unique constraint (HEAD_ADMIN.SYS_C007450)",
                "unique constraint (HEAD_ADMIN.SYS_C007451)"
            ]
            let message = "Ошибка при добавлении курьера"
            if (err.message.includes(errors[0])) {
                message = "Курьер с таким Email уже существует"
            } else if (err.message.includes(errors[1])) {
                message = "Курьер с таким номером телефона уже существует"
            }
            return res.status(422).json({error: [{msg: message}]})
        });

}

const changeCourier = (req, res) => {
    let id = req.params['courierId'];

    if (!parseInt(id, 10)) {
        return res.status(422).json({error: [{msg: "Неверный идентификатор курьера"}]})
    }
    id = parseInt(id, 10);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({error: errors.array()});
    }
    let new_data = {
        full_name: req.body.full_name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        date_of_birth: req.body.date_of_birth,
        salary: req.body.salary,
        active: req.body.active !== undefined ? 1 : 0,
        ready_to_go: req.body.ready_to_go !== undefined ? 1 : 0
    }

    Courier.changeCourier(id, new_data)
        .then(() => res.status(200).json({message: "success"}))
        .catch((err) => {
            const errors = [
                "unique constraint (HEAD_ADMIN.SYS_C007450)",
                "unique constraint (HEAD_ADMIN.SYS_C007451)"
            ]
            let message = "Ошибка при изменении курьера"
            if (err.message.includes(errors[0])) {
                message = "Курьер с таким Email уже существует"
            } else if (err.message.includes(errors[1])) {
                message = "Курьер с таким номером телефона уже существует"
            }
            return res.status(422).json({error: [{msg: message}]})
        });

}

const deleteCourier = (req, res) => {
    let id = req.params['courierId'];

    if (!parseInt(id, 10)) {
        return res.status(422).json({error: [{msg: "Неверный идентификатор курьера"}]})
    }
    id = parseInt(id, 10);

    Courier.deleteOne(id).then(() => res.status(200).json({message: "success"}))
        .catch(() => res.status(422).json({error: [{msg: "Ошибка при удалении курьера"}]}));
}

exports.getAll = getAll;
exports.getCreationForm = getCreationForm;
exports.getChangeForm = getChangeForm;
exports.createNewCourier = createNewCourier;
exports.changeCourier = changeCourier;
exports.deleteCourier = deleteCourier;