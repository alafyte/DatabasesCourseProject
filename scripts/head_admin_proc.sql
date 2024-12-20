CREATE OR REPLACE PACKAGE HEAD_ADMIN_PACKAGE AS
    PROCEDURE ADD_RESTAURANT(
        P_ADDRESS NVARCHAR2,
        P_LOCATION SDO_GEOMETRY,
        P_COVERAGE_AREA SDO_GEOMETRY,
        P_RESTAURANT_ADMIN INT,
        P_OPEN_TIME TIMESTAMP,
        P_CLOSE_TIME TIMESTAMP,
        P_DELIVERY_START_TIME TIMESTAMP,
        P_DELIVERY_END_TIME TIMESTAMP
    );
    PROCEDURE UPDATE_RESTAURANT(
        P_ID INT,
        P_ADDRESS NVARCHAR2 DEFAULT NULL,
        P_LOCATION SDO_GEOMETRY DEFAULT NULL,
        P_COVERAGE_AREA SDO_GEOMETRY DEFAULT NULL,
        P_ADMIN INT,
        P_OPEN_TIME TIMESTAMP DEFAULT NULL,
        P_CLOSE_TIME TIMESTAMP DEFAULT NULL,
        P_DELIVERY_START_TIME TIMESTAMP DEFAULT NULL,
        P_DELIVERY_END_TIME TIMESTAMP DEFAULT NULL
    );
    PROCEDURE DELETE_RESTAURANT(
        P_ID INT
    );
    PROCEDURE CREATE_USER_ROLE(ROLE_NAME USER_ROLE.ROLE_NAME%TYPE);
    PROCEDURE REGISTER_HEAD_ADMIN(
        FULL_NAME PERSONAL_DATA.FULL_NAME%TYPE,
        EMAIL PERSONAL_DATA.EMAIL%TYPE,
        PHONE_NUMBER PERSONAL_DATA.PHONE_NUMBER%TYPE,
        DATE_OF_BIRTH IN VARCHAR2,
        PASSWORD IN VARCHAR2
    );
    PROCEDURE REGISTER_RESTAURANT_ADMIN(
        FULL_NAME PERSONAL_DATA.FULL_NAME%TYPE,
        EMAIL PERSONAL_DATA.EMAIL%TYPE,
        PHONE_NUMBER PERSONAL_DATA.PHONE_NUMBER%TYPE,
        DATE_OF_BIRTH IN VARCHAR2,
        PASSWORD IN VARCHAR2
    );
    PROCEDURE INSERT_SIZE_CATEGORY(
        ITEM_SIZE SIZE_CATEGORY.ID%TYPE,
        MARKUP SIZE_CATEGORY.MARKUP%TYPE
    );
    PROCEDURE INSERT_MENU_ITEM(
        P_ITEM_NAME MENU.ITEM_NAME%TYPE,
        P_SMALL_SIZE_PRICE MENU.SMALL_SIZE_PRICE%TYPE,
        P_DESCRIPTION MENU.DESCRIPTION%TYPE,
        P_ITEM_IMAGE MENU.ITEM_IMAGE%TYPE
    );
    PROCEDURE UPDATE_MENU(
        P_ID INT,
        P_ITEM_NAME NVARCHAR2 DEFAULT NULL,
        P_SMALL_SIZE_PRICE MENU.SMALL_SIZE_PRICE%TYPE DEFAULT NULL,
        P_DESCRIPTION NVARCHAR2 DEFAULT NULL,
        P_ITEM_IMAGE NVARCHAR2 DEFAULT NULL
    );
    PROCEDURE DELETE_PRODUCT(
        P_ID INT
    );
END HEAD_ADMIN_PACKAGE;



CREATE OR REPLACE PACKAGE BODY HEAD_ADMIN_PACKAGE AS
    PROCEDURE UPDATE_RESTAURANT(
        P_ID INT,
        P_ADDRESS NVARCHAR2 DEFAULT NULL,
        P_LOCATION SDO_GEOMETRY DEFAULT NULL,
        P_COVERAGE_AREA SDO_GEOMETRY DEFAULT NULL,
        P_ADMIN INT,
        P_OPEN_TIME TIMESTAMP DEFAULT NULL,
        P_CLOSE_TIME TIMESTAMP DEFAULT NULL,
        P_DELIVERY_START_TIME TIMESTAMP DEFAULT NULL,
        P_DELIVERY_END_TIME TIMESTAMP DEFAULT NULL
    ) IS
        v_exists NUMBER;
        v_result VARCHAR2(10);
        v_area SDO_GEOMETRY;
    BEGIN
        SELECT COVERAGE_AREA INTO v_area FROM RESTAURANT WHERE ID = P_ID;
        SELECT CASE
                   WHEN SDO_RELATE(P_LOCATION, COALESCE(P_COVERAGE_AREA, v_area), 'mask=inside+coveredby') = 'TRUE'
                       THEN 'TRUE'
                   ELSE 'FALSE'
                   END
        INTO v_result
        FROM DUAL;

        IF v_result = 'FALSE' THEN
            RAISE_APPLICATION_ERROR('-20002', 'Местоположение ресторана не находится в зоне доставки');
        END IF;

        SELECT COUNT(*)
        INTO v_exists
        FROM RESTAURANT R
        WHERE SDO_RELATE(COALESCE(P_COVERAGE_AREA, v_area), R.COVERAGE_AREA, 'mask=anyinteract') = 'TRUE'
        AND ID <> P_ID;

        IF v_exists > 0 THEN
            RAISE_APPLICATION_ERROR('-20003', 'Зона доставки пересекается с зоной доставки другого ресторана');
        END IF;
        UPDATE RESTAURANT
        SET ADDRESS             = COALESCE(P_ADDRESS, ADDRESS),
            LOCATION            = COALESCE(P_LOCATION, LOCATION),
            COVERAGE_AREA       = COALESCE(P_COVERAGE_AREA, COVERAGE_AREA),
            RESTAURANT_ADMIN    = COALESCE(P_ADMIN, RESTAURANT_ADMIN),
            OPEN_TIME           = COALESCE(P_OPEN_TIME, OPEN_TIME),
            CLOSE_TIME          = COALESCE(P_CLOSE_TIME, CLOSE_TIME),
            DELIVERY_START_TIME = COALESCE(P_DELIVERY_START_TIME, DELIVERY_START_TIME),
            DELIVERY_END_TIME   = COALESCE(P_DELIVERY_END_TIME, DELIVERY_END_TIME)
        WHERE ID = P_ID;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR('-20001', 'Произошла ошибка: ' || SQLERRM);
    END UPDATE_RESTAURANT;

    PROCEDURE ADD_RESTAURANT(
        P_ADDRESS NVARCHAR2,
        P_LOCATION SDO_GEOMETRY,
        P_COVERAGE_AREA SDO_GEOMETRY,
        P_RESTAURANT_ADMIN INT,
        P_OPEN_TIME TIMESTAMP,
        P_CLOSE_TIME TIMESTAMP,
        P_DELIVERY_START_TIME TIMESTAMP,
        P_DELIVERY_END_TIME TIMESTAMP
    ) IS
        v_exists NUMBER;
        v_result VARCHAR2(10);
    BEGIN
        SELECT CASE
                   WHEN SDO_RELATE(P_LOCATION, P_COVERAGE_AREA, 'mask=inside+coveredby') = 'TRUE'
                       THEN 'TRUE'
                   ELSE 'FALSE'
                   END
        INTO v_result
        FROM DUAL;

        IF v_result = 'FALSE' THEN
            RAISE_APPLICATION_ERROR('-20002', 'Местоположение ресторана не находится в зоне доставки');
        END IF;

        SELECT COUNT(*)
        INTO v_exists
        FROM RESTAURANT R
        WHERE SDO_RELATE(P_COVERAGE_AREA, R.COVERAGE_AREA, 'mask=anyinteract') = 'TRUE';

        IF v_exists > 0 THEN
            RAISE_APPLICATION_ERROR('-20003', 'Зона доставки пересекается с зоной доставки другого ресторана');
        END IF;

        INSERT INTO RESTAURANT (ADDRESS, LOCATION, COVERAGE_AREA, RESTAURANT_ADMIN, OPEN_TIME, CLOSE_TIME,
                                DELIVERY_START_TIME, DELIVERY_END_TIME)
        VALUES (P_ADDRESS, P_LOCATION, P_COVERAGE_AREA, P_RESTAURANT_ADMIN, P_OPEN_TIME, P_CLOSE_TIME,
                P_DELIVERY_START_TIME, P_DELIVERY_END_TIME);

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR('-20001', 'Произошла ошибка: ' || SQLERRM);
    END ADD_RESTAURANT;


    PROCEDURE DELETE_RESTAURANT(
        P_ID INT
    ) IS
        V_COUNT INT;
    BEGIN
        SELECT COUNT(*) INTO V_COUNT FROM RESTAURANT WHERE ID = P_ID;

        IF V_COUNT = 0 THEN
            RAISE_APPLICATION_ERROR('-20002', 'Ресторан с указанным ID не существует.');
        END IF;
        DELETE FROM RESTAURANT WHERE ID = P_ID;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR('-20001', 'Произошла ошибка: ' || SQLERRM);
    END DELETE_RESTAURANT;

    PROCEDURE CREATE_USER_ROLE(ROLE_NAME USER_ROLE.ROLE_NAME%TYPE)
        IS
    BEGIN
        INSERT INTO USER_ROLE (ROLE_NAME) VALUES (ROLE_NAME);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Произошла ошибка: ' || SQLERRM);
    END CREATE_USER_ROLE;

    PROCEDURE REGISTER_HEAD_ADMIN(
        FULL_NAME PERSONAL_DATA.FULL_NAME%TYPE,
        EMAIL PERSONAL_DATA.EMAIL%TYPE,
        PHONE_NUMBER PERSONAL_DATA.PHONE_NUMBER%TYPE,
        DATE_OF_BIRTH IN VARCHAR2,
        PASSWORD IN VARCHAR2
    )
        IS
        USER_ROLE_ID USER_ROLE.ID%TYPE;
        USER_DATA_ID PERSONAL_DATA.ID%TYPE;
        USER_ID      APP_USER.ID%TYPE;
    BEGIN
        SELECT ID INTO USER_ROLE_ID FROM USER_ROLE WHERE ROLE_NAME = 'head_admin';
        USER_DATA_ID :=
                USER_PACKAGE.INSERT_PERSONAL_DATA(FULL_NAME => FULL_NAME, EMAIL => EMAIL, PHONE_NUMBER => PHONE_NUMBER,
                                                  DATE_OF_BIRTH => DATE_OF_BIRTH);
        INSERT INTO APP_USER (PASSWORD_HASH, USER_ROLE, PERSONAL_DATA)
        VALUES (PASSWORD, USER_ROLE_ID, USER_DATA_ID)
        RETURNING ID INTO USER_ID;

        INSERT INTO CART (USER_ID) VALUES (USER_ID);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Произошла ошибка: ' || SQLERRM);
    END REGISTER_HEAD_ADMIN;

    PROCEDURE REGISTER_RESTAURANT_ADMIN(
        FULL_NAME PERSONAL_DATA.FULL_NAME%TYPE,
        EMAIL PERSONAL_DATA.EMAIL%TYPE,
        PHONE_NUMBER PERSONAL_DATA.PHONE_NUMBER%TYPE,
        DATE_OF_BIRTH IN VARCHAR2,
        PASSWORD IN VARCHAR2
    )
        IS
        USER_ROLE_ID USER_ROLE.ID%TYPE;
        USER_DATA_ID PERSONAL_DATA.ID%TYPE;
        USER_ID      APP_USER.ID%TYPE;
    BEGIN
        SELECT ID INTO USER_ROLE_ID FROM USER_ROLE WHERE ROLE_NAME = 'restaurant_admin';
        USER_DATA_ID :=
                USER_PACKAGE.INSERT_PERSONAL_DATA(FULL_NAME => FULL_NAME, EMAIL => EMAIL, PHONE_NUMBER => PHONE_NUMBER,
                                                  DATE_OF_BIRTH => DATE_OF_BIRTH);
        INSERT INTO APP_USER (PASSWORD_HASH, USER_ROLE, PERSONAL_DATA)
        VALUES (PASSWORD, USER_ROLE_ID, USER_DATA_ID)
        RETURNING ID INTO USER_ID;

        INSERT INTO CART (USER_ID) VALUES (USER_ID);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Произошла ошибка: ' || SQLERRM);
    END REGISTER_RESTAURANT_ADMIN;

    PROCEDURE INSERT_SIZE_CATEGORY(
        ITEM_SIZE SIZE_CATEGORY.ID%TYPE,
        MARKUP SIZE_CATEGORY.MARKUP%TYPE
    )
        IS
    BEGIN
        INSERT INTO SIZE_CATEGORY (ITEM_SIZE, MARKUP)
        VALUES (ITEM_SIZE, MARKUP);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Произошла ошибка: ' || SQLERRM);
    END INSERT_SIZE_CATEGORY;

    PROCEDURE INSERT_MENU_ITEM(
        P_ITEM_NAME MENU.ITEM_NAME%TYPE,
        P_SMALL_SIZE_PRICE MENU.SMALL_SIZE_PRICE%TYPE,
        P_DESCRIPTION MENU.DESCRIPTION%TYPE,
        P_ITEM_IMAGE MENU.ITEM_IMAGE%TYPE
    )
    AS
    BEGIN
        INSERT INTO MENU (ITEM_NAME, SMALL_SIZE_PRICE, DESCRIPTION, ITEM_IMAGE)
        VALUES (P_ITEM_NAME, P_SMALL_SIZE_PRICE, P_DESCRIPTION, P_ITEM_IMAGE);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20001, 'Произошла ошибка: ' || SQLERRM);
    END INSERT_MENU_ITEM;

    PROCEDURE UPDATE_MENU(
        P_ID INT,
        P_ITEM_NAME NVARCHAR2 DEFAULT NULL,
        P_SMALL_SIZE_PRICE MENU.SMALL_SIZE_PRICE%TYPE DEFAULT NULL,
        P_DESCRIPTION NVARCHAR2 DEFAULT NULL,
        P_ITEM_IMAGE NVARCHAR2 DEFAULT NULL) IS
    BEGIN
        UPDATE MENU
        SET ITEM_NAME        = COALESCE(P_ITEM_NAME, ITEM_NAME),
            SMALL_SIZE_PRICE = COALESCE(P_SMALL_SIZE_PRICE, SMALL_SIZE_PRICE),
            DESCRIPTION      = COALESCE(P_DESCRIPTION, DESCRIPTION),
            ITEM_IMAGE       = COALESCE(P_ITEM_IMAGE, ITEM_IMAGE)
        WHERE ID = P_ID;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR('-20001', 'Произошла ошибка: ' || SQLERRM);
    END UPDATE_MENU;

    PROCEDURE DELETE_PRODUCT(
        P_ID INT
    ) IS
        V_COUNT INT;
    BEGIN
        SELECT COUNT(*) INTO V_COUNT FROM MENU WHERE ID = P_ID;

        IF V_COUNT = 0 THEN
            RAISE_APPLICATION_ERROR('-20002', 'Товар с указанным ID не существует.');
        END IF;
        DELETE FROM MENU WHERE ID = P_ID;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR('-20001', 'Произошла ошибка: ' || SQLERRM);
    END DELETE_PRODUCT;
END HEAD_ADMIN_PACKAGE;

