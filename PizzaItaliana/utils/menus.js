exports.main_menu = [
    {id: 1, tab_title: 'Главная', url: '/'},
    {id: 2, tab_title: 'О нас', url: '/about'},
    {id: 3, tab_title: 'Контакты', url: '/contact'},
    {id: 4, tab_title: 'Клиенту', url: '/rules'},
];

exports.auth_menu =  [
    {id: 5, tab_title: 'Войти', url: '/users/login'},
    {id: 6, tab_title: 'Регистрация', url: '/users/registration'},
];

exports.admin_menu = [
    {tab_title: 'Администраторы ресторанов', url: '/admin/administrators'},
    {tab_title: 'Рестораны', url: '/restaurants'},
    {tab_title: 'Управление меню', url: '/menu'},
]

exports.getRestaurantAdminMenu = (rest_id) => {
    return [
        {tab_title: 'Курьеры', url: '/couriers'},
        {tab_title: 'Ресторан', url: `/restaurants/restaurant/${rest_id}`},
    ]
}