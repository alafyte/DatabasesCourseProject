module.exports = {
    secret: "jdj2342d12j23klikjdcdfjosi"
}

let credentials = {
    user: 'HEAD_ADMIN',
    password: 'qwerty1234'
}

module.exports.getCurrentCredentials = () => {
    return credentials;
}
module.exports.setCurrentCredentials = (user_role = null) => {

    if (user_role == null || user_role === 'user') {
        credentials = {
            user: 'CUSTOMER',
            password: 'qwerty12345'
        }
    } else if (user_role === 'restaurant_admin') {
        credentials = {
            user: 'REST_ADMIN',
            password: 'qwerty12345'
        }
    } else if (user_role === 'head_admin') {
        credentials = {
            user: 'HEAD_ADMIN',
            password: 'qwerty1234'
        }
    }
}
