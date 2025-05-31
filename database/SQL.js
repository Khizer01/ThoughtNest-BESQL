import sql from 'mssql';
import { SQL_USER, SQL_PASSWORD, SQL_DATABASE, SQL_SERVER, SQL_PORT } from "../configs/env.js";

const config = {
    user: SQL_USER,
    password: SQL_PASSWORD,
    database: SQL_DATABASE,
    server: SQL_SERVER, 
    port: parseInt(SQL_PORT),
    options: {
        encrypt: false, 
        trustServerCertificate: true,
    },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

export { sql, poolConnect, pool };