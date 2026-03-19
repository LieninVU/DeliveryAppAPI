const { Pool } = require("pg");
require("dotenv").config();


const pool = new Pool({
    user: process.env.DB_USER || "dbuser",
    host: process.env.HOST || "localhost",
    database: process.env.DATABASE || "delivery",
    password: process.env.DB_PASS || "123",
    port: process.env.DB_PORT || "5432",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})


async function query(sql, values= []){
    try{
        const connect = pool.connect()
        let result
        values.length === 0 ? result = await connect.query(sql) : result = await connect.query(sql, values)
        connect.release();
        return result;
        } 
        catch (err){
        console.log("Error: " + err);
        throw err;
    }
    finally{
        connect.release();
    }
    
}

export default query;