BEGIN
    HEAD_ADMIN_PACKAGE.CREATE_USER_ROLE('head_admin');
    HEAD_ADMIN_PACKAGE.CREATE_USER_ROLE('restaurant_admin');
    HEAD_ADMIN_PACKAGE.CREATE_USER_ROLE('user');
END;

BEGIN
    HEAD_ADMIN_PACKAGE.INSERT_SIZE_CATEGORY(25, 1);
    HEAD_ADMIN_PACKAGE.INSERT_SIZE_CATEGORY(30, 1.4);
    HEAD_ADMIN_PACKAGE.INSERT_SIZE_CATEGORY(35, 1.6);
END;

BEGIN
    HEAD_ADMIN_PACKAGE.REGISTER_HEAD_ADMIN('Иванов Иван Иванович', 'head_admin@test.by', '+375(44)374-33-44',
                        '23-06-1983', '$2a$07$NaB9X1efA8IVxaoDkQWLee7qL7e6vvVlnwUxjOY1Vnlvo5XC0HFc2');
END;
