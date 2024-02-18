const User = require('../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator')
const {secret, setCurrentCredentials} = require("../config")
const Restaurant = require("../models/restaurant");

const generateAccessToken = (id, role) => {
    const payload = {
        id,
        role
    }
    return jwt.sign(payload, secret, {expiresIn: "72h"})
}


const registration = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()})
        }
        if (req.body.password !== req.body.repeat_password) {
            return res.status(422).json({error: [{msg: "Пароли не совпадают"}]})
        }
        const {full_name, email, phone_number, date_of_birth, password} = req.body;

        const hashPassword = bcrypt.hashSync(password, 7);
        const user = new User(full_name, email, phone_number, date_of_birth, "user", hashPassword)
        await user.save()
        return res.status(200).json({message: 'Success'})
    } catch (e) {
        const errors = [
            "unique constraint (HEAD_ADMIN.SYS_C007450)",
            "unique constraint (HEAD_ADMIN.SYS_C007451)"
        ]
        let message = "Ошибка при регистрации"
        if (e.message.includes(errors[0])) {
            message = "Пользователь с таким Email уже существует"
        } else if (e.message.includes(errors[1])) {
            message = "Пользователь с таким номером телефона уже существует"
        }
        return res.status(422).json({error: [{msg: message}]})
    }
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const users = await User.getAll();
        let current_user = null;
        for (const user of users) {
            if (user.EMAIL === email) {
                current_user = user;
                break;
            }
        }
        if (!current_user) {
            return res.status(422).json({error: `Пользователь ${email} не найден`})
        }
        const validPassword = bcrypt.compareSync(password, current_user.PASSWORD_HASH)
        if (!validPassword) {
            return res.status(422).json({error: `Введен неверный пароль`})
        }
        delete current_user.PASSWORD_HASH;
        const token = generateAccessToken(current_user.ID, current_user.ROLE_NAME);
        req.session.user = {
            ID: current_user.ID,
            FULL_NAME: current_user.FULL_NAME,
            EMAIL: current_user.EMAIL,
            PHONE: current_user.PHONE_NUMBER,
            ROLE_NAME: current_user.ROLE_NAME
        };

        if (current_user.ROLE_NAME === 'restaurant_admin') {
            let rest_id = await Restaurant.getRestaurantByAdmin(current_user.ID);
            req.session.restaurant_id = rest_id.ID;
        }

        setCurrentCredentials(current_user.ROLE_NAME);

        res.cookie("token", token, {
            httpOnly: true,
        })
        res.redirect('/');
    } catch (e) {
        return res.status(422).json({error: 'Ошибка входа'})
    }
}

const logout = (req, res) => {
    res.clearCookie("token");
    req.session.user = {};
    res.redirect('/users/login');
}

exports.registration = registration;
exports.login = login;
exports.logout = logout;