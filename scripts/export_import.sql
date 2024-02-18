CREATE OR REPLACE DIRECTORY JSON_DATA_DIR AS 'C:\CW\json_data_dir';


CREATE OR REPLACE PROCEDURE EXPORT_MENU_TO_JSON(p_file_name VARCHAR2) IS
    v_json_data CLOB;
    v_file      UTL_FILE.FILE_TYPE;
    v_first_row BOOLEAN := TRUE;
BEGIN
    v_file := UTL_FILE.FOPEN('JSON_DATA_DIR', p_file_name, 'W');

    UTL_FILE.PUT_LINE(v_file, '[');

    FOR rec IN (SELECT JSON_OBJECT(key 'item_name' VALUE ITEM_NAME,
                                   key 'small_size_price' VALUE SMALL_SIZE_PRICE,
                                   key 'description' VALUE DESCRIPTION,
                                   key 'item_image' VALUE ITEM_IMAGE) AS json_data
                FROM MENU
                ORDER BY ID)
        LOOP
            v_json_data := rec.json_data;

            IF NOT v_first_row THEN
                UTL_FILE.PUT_LINE(v_file, ',');
            ELSE
                v_first_row := FALSE;
            END IF;

            UTL_FILE.PUT_LINE(v_file, v_json_data);
        END LOOP;

    UTL_FILE.PUT_LINE(v_file, ']');

    UTL_FILE.FFLUSH(v_file);
    UTL_FILE.FCLOSE(v_file);
     EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR('-20001', 'Произошла ошибка: ' || SQLERRM);
END EXPORT_MENU_TO_JSON;


CREATE OR REPLACE PROCEDURE IMPORT_MENU_FROM_JSON(p_file_name VARCHAR2) IS
BEGIN
    FOR rec IN (SELECT *
                FROM JSON_TABLE(BFILENAME('JSON_DATA_DIR', p_file_name), '$[*]' COLUMNS (
                    item_name VARCHAR2(255) PATH '$.item_name',
                    small_size_price NUMBER(5, 2) PATH '$.small_size_price',
                    description VARCHAR2(500) PATH '$.description',
                    item_image VARCHAR2(50) PATH '$.item_image'
                    ))
        )
        LOOP

            INSERT INTO MENU (ITEM_NAME, SMALL_SIZE_PRICE, DESCRIPTION, ITEM_IMAGE)
            VALUES (rec.item_name, rec.small_size_price, rec.description, rec.item_image);
            COMMIT;
        END LOOP;
     EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR('-20001', 'Произошла ошибка: ' || SQLERRM);
END IMPORT_MENU_FROM_JSON;


BEGIN
    EXPORT_MENU_TO_JSON('menu1234.json');
END;

SELECT *
FROM GET_PRODUCTS
WHERE ITEM_NAME LIKE '%import%';

BEGIN
    IMPORT_MENU_FROM_JSON('imp.json');
END;

delete MENU;
commit;


--DELETE FROM MENU WHERE ITEM_NAME LIKE '%import%';
