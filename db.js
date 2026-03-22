const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.HOST || "localhost",
    database: process.env.DATABASE || "food_delivery",
    password: process.env.DB_PASS || "postgres",
    port: process.env.DB_PORT || "5432",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

/**
 * Выполняет SQL-запрос с параметризацией
 * @param {string} sql - SQL запрос с плейсхолдерами ($1, $2, ...)
 * @param {Array} values - Массив значений для плейсхолдеров
 * @returns {Promise<Object>} Результат запроса (rows, rowCount, etc.)
 */
async function query(sql, values = []) {
    const client = await pool.connect();
    try {
        const result = values.length === 0 
            ? await client.query(sql) 
            : await client.query(sql, values);
        return result;
    } catch (err) {
        console.error("Database query error:", err.message);
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Выполняет транзакцию
 * @param {Function} callback - Асинхронная функция, принимающая client
 * @returns {Promise<any>} Результат транзакции
 */
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Transaction error:", err.message);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { query, transaction, pool };
