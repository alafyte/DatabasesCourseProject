ALTER SESSION SET "_ORACLE_SCRIPT"= TRUE;

CREATE
    PLUGGABLE DATABASE RESTAURANT_PDB
    ADMIN USER HEAD_ADMIN IDENTIFIED BY qwerty1234
    ROLES = (DBA)
    STORAGE (MAXSIZE 1G);

SELECT NAME, OPEN_MODE
FROM V$PDBS;


ALTER PLUGGABLE DATABASE RESTAURANT_PDB OPEN;

ALTER PLUGGABLE DATABASE RESTAURANT_PDB SAVE STATE;


CREATE TABLESPACE RESTAURANT_TS
  DATAFILE 'RESTAURANT_TS.DBF'
  SIZE 100M
  AUTOEXTEND ON NEXT 10M
  BLOCKSIZE 8192
  EXTENT MANAGEMENT LOCAL;

CREATE TEMPORARY TABLESPACE RESTAURANT_TS_TEMP
  TEMPFILE 'RESTAURANT_TS_TEMP.DBF'
  SIZE 100M
  AUTOEXTEND ON NEXT 10M
  EXTENT MANAGEMENT LOCAL;

