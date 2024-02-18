const jwt = require('jsonwebtoken')
const {secret} = require('../config')


module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }

        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(403).json({error: "Пользователь не авторизован"})
            }
            const {role: userRole} = jwt.verify(token, secret);
            let hasRole = roles.includes(userRole);

            if (!hasRole) {
                return res.status(403).json({error: "У вас нет доступа"})
            }
            next();
        } catch (e) {
            console.log(e)
            return res.status(403).json({error: "Пользователь не авторизован"})
        }
    }
};