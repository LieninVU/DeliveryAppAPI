const query = require("./db");

exports.getClients = async (req, res) => {
    const sql = "SELECT * FROM Clients"
    try{
        const response = await query(sql);
        const results = response.rows;
        res.status(200).json({success: true, result: results});
    }
    catch (err){
        console.log("You Dont Get Clients, Error: " + err.message);
        res.status(500).json({success: false, error: err.message});
    }
}

exports.getClient = async (req, res) => {
    const sql = "SELECT * FROM Clients WHERE Client_id = $1";
    const id = req.params.id;
    try{
        const response = await query(sql, id);
        const results = response.rows;
        res.status(200).json({success: true, result: results});
    }
    catch (err){
        console.log("You Dont Get Client, Error: " + err.message);
        res.status(500).json({success: false, error: err.message});
    }
}

exports.registrateUser = async (req, res) => {
    const sql = "INSERT INTO Clients (First_name, Last_name, Phone, Email, Login, Password, Role_id) VALUES($1, $2, $3, $4, $5, $6, $7)";
    const First_name = req.body.First_name;
    const Last_name = req.body.Last_name;
    const Phone = req.body.Phone;
    const Email = req.body.Email;
    const Login = req.body.Login;
    const Password = req.body.Password;
    const Role_id = req.body.Role_id;
    try{
        const checkSql = "SELECT * FROM Clients WHERE Login = $1";
        const existing = await query(checkSql, [Login]);
        if (existing.rowCount > 0) {
            return res.status(400).json({ success: false, error: "User already exists" });
        }

        const response = await query(sql, [First_name, Last_name, Phone, Email, Login, Password, Role_id]);
        res.status(200).json({success: true, result: results});
    }
    catch (err){
        console.log("You Dont Registreted Client, Error: " + err.message);
        res.status(500).json({success: false, error: err.message});
    }    

}

exports.authentication = async (req, res) => {
    const sql = "SELECT * FROM Clients WHERE Login = $1 AND Password = $2";
    const login = req.params.Login;
    const password = req.params.Password;
    try{
        const response = await query(sql, [login, password]);
        const quant = await response.rowCount;
        quant === 1 ? res.status(200).json({success: true }) : () => {throw new Error("You have more than 1 Client with this params");}
    }
    catch(err){
        console.log("You Dont Authenticated Error: " + err.message);
        res.status(500).json({success: false, error: err.message});
    }
}

