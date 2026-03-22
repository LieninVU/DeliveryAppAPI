const bcrypt = require('bcryptjs');
const { query } = require('./db');

async function createAdmin() {
    const login = 'admin';
    const password = 'admin123';
    
    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);
    
    try {
        // Проверяем, существует ли уже админ
        const check = await query('SELECT client_id FROM clients WHERE login = $1', [login]);
        
        if (check.rowCount > 0) {
            console.log('Администратор уже существует!');
            console.log('Логин:', login);
            console.log('Пароль:', password);
            return;
        }
        
        // Создаём администратора (role_id = 1)
        const result = await query(`
            INSERT INTO clients (first_name, last_name, phone, email, login, password_hash, role_id)
            VALUES ('Admin', 'User', '+79990000000', 'admin@example.com', $1, $2, 1)
            RETURNING client_id, login, role_id
        `, [login, passwordHash]);
        
        console.log('Администратор создан!');
        console.log('Логин:', login);
        console.log('Пароль:', password);
        console.log('ID:', result.rows[0].client_id);
        
    } catch (err) {
        console.error('Ошибка:', err.message);
        process.exit(1);
    }
    
    process.exit(0);
}

createAdmin();
