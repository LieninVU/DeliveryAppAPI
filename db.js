const { Pool } = require("pg");
require("dotenv").config();


const pool = new Pool({
    user: process.env.DB_USER || "dbuser",
    host: process.env.HOST || "localhost",
    database: process.env.DATABASE || "delivery",
    password: process.env.DB_PASS || "123",
    port: process.env.port || "5432"
})


function query(sql, values){
    
}
