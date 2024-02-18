const {body} = require('express-validator');
const {isFloat} = require("validator");

module.exports.menuDataValidator = [
    body("item_name")
        .trim()
        .notEmpty().withMessage('Название блюда не должно быть пустым')
        .isLength({min: 1, max: 255}).withMessage('Название блюда должно содержать от 1 до 255 символов'),
    body("price")
        .notEmpty().withMessage('Цена не должна быть пустой')
        .isFloat({min: 0.01, max: 1000}).withMessage('Цена должна быть указана числом в пределах от 0.01 до 1000'),
    body("description")
        .trim()
        .notEmpty().withMessage('Описание блюда не должно быть пустым')
        .isLength({max: 499}).withMessage('Описание товара не должно превышать 500 символов'),
]

module.exports.courierDataValidator = [
    body("full_name")
        .trim()
        .notEmpty().withMessage("ФИО курьера не должно быть пустым")
        .isLength({min: 1, max: 100}).withMessage('ФИО должно содержать от 1 до 100 символов'),
    body("email")
        .trim()
        .notEmpty().withMessage('Email не должен быть пустым')
        .isEmail().withMessage("Неккоректный Email-адрес"),
    body("phone_number")
        .trim()
        .notEmpty().withMessage('Номер телефона не может быть пустым')
        .matches('^\\+375\\(\\d{2}\\)\\d{3}-\\d{2}-\\d{2}$').withMessage("Неверный формат номера телефона"),
    body("date_of_birth")
        .trim()
        .notEmpty().withMessage("Дата рождения не может быть пустой")
        .custom(value => {
            let enteredDate = new Date(value);
            let today = new Date();
            if (enteredDate > today) {
                throw new Error("Неверная дата рождения");
            }
            return true;
        }).withMessage("Неверная дата рождения"),
    body("salary")
        .notEmpty().withMessage("Запрлата не может быть пустой")
        .isFloat({min: 10, max: 1000000}).withMessage("Зарплата должна быть указана числом в пределах от 10 до 1000000")
]

module.exports.personalDataValidator = [
    body("full_name")
        .trim()
        .notEmpty().withMessage("ФИО не должно быть пустым")
        .isLength({min: 1, max: 100}).withMessage('ФИО должно содержать от 1 до 100 символов'),
    body("email")
        .trim()
        .notEmpty().withMessage('Email не должен быть пустым')
        .isEmail().withMessage("Неккоректный Email-адрес"),
    body("phone_number")
        .trim()
        .notEmpty().withMessage('Номер телефона не может быть пустым')
        .matches('^\\+375\\(\\d{2}\\)\\d{3}-\\d{2}-\\d{2}$').withMessage("Неверный формат номера телефона"),
    body("date_of_birth")
        .trim()
        .notEmpty().withMessage("Дата рождения не может быть пустой")
        .custom(value => {
            let enteredDate = new Date(value);
            let today = new Date();
            if (enteredDate > today) {
                throw new Error("Неверная дата рождения");
            }
            return true;
        }).withMessage("Неверная дата рождения"),
    body("password")
        .trim()
        .notEmpty().withMessage("Пароль не может быть пустой")
        .isLength({min: 8, max: 16}).withMessage("Длина пароля должна быть в пределах от 8 до 16 символов"),
    body("repeat_password")
        .trim()
        .notEmpty().withMessage("Пароль не может быть пустой")
        .isLength({min: 8, max: 16}).withMessage("Длина пароля должна быть в пределах от 8 до 16 символов")
]

module.exports.restaurantDataValidator = [
    body("address")
        .trim()
        .notEmpty().withMessage("Адрес не может быть пустым")
        .isLength({min: 1, max: 50}).withMessage("Адрес должен содержать от 1 до 50 символов"),
    body("longitude")
        .notEmpty().withMessage("Ошибка при определении местоположения ресторана")
        .isFloat().withMessage("Ошибка при определении местоположения ресторана"),
    body("latitude")
        .notEmpty().withMessage("Ошибка при определении местоположения ресторана")
        .isFloat().withMessage("Ошибка при определении местоположения ресторана"),
    body("admins")
        .notEmpty().withMessage("Администратор не может быть пустым")
        .isInt().withMessage("Неверный формат идентификатора администратора"),
    body("open_time")
        .notEmpty().withMessage("Время открытия не может быть пустым")
        .isTime({hourFormat: "hour24"}).withMessage("Неккоректный формат времени открытия"),
    body("close_time")
        .notEmpty().withMessage("Время закрытия не может быть пустым")
        .isTime({hourFormat: "hour24"}).withMessage("Неккоректный формат времени закрытия"),
    body("delivery_start_time")
        .notEmpty().withMessage("Время начала доставки не может быть пустым")
        .isTime({hourFormat: "hour24"}).withMessage("Неккоректный формат времени начала доставки"),
    body("delivery_end_time")
        .notEmpty().withMessage("Время окончания доставки не может быть пустым")
        .isTime({hourFormat: "hour24"}).withMessage("Неккоректный формат времени окончания доставки"),
]
