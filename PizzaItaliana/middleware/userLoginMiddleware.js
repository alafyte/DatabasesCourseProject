module.exports = function (shouldBeLoggedIn) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }

        const token = !!req.cookies.token;

        if (shouldBeLoggedIn === token)
            next();
        else if (shouldBeLoggedIn)
            return res.status(403).json({error: "Для продолжения войдите в систему"})
        else
            return res.status(403).json({error: "Доступ запрещен"})
    }
}