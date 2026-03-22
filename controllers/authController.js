const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Регистрация нового пользователя
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        const { first_name, last_name, phone, email, login, password, role_id } = req.body;

        // Валидация обязательных полей
        if (!first_name || !last_name || !phone || !login || !password) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: first_name, last_name, phone, login, password'
            });
        }

        // Проверка существования пользователя с таким login или phone
        const checkQuery = 'SELECT client_id FROM clients WHERE login = $1 OR phone = $2';
        const existing = await query(checkQuery, [login, phone]);
        
        if (existing.rowCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'User with this login or phone already exists'
            });
        }

        // Хэширование пароля
        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        // Вставка пользователя (role_id по умолчанию = 2, customer)
        const insertQuery = `
            INSERT INTO clients (first_name, last_name, phone, email, login, password_hash, role_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING client_id, first_name, last_name, phone, email, login, role_id, created_at
        `;
        
        const result = await query(insertQuery, [
            first_name,
            last_name,
            phone,
            email || null,
            login,
            passwordHash,
            role_id || 2
        ]);

        const user = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                client_id: user.client_id,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                email: user.email,
                login: user.login,
                role_id: user.role_id,
                created_at: user.created_at
            }
        });

    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Логин пользователя и получение JWT токена
 * POST /api/auth/login
 */
async function login(req, res) {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: login, password'
            });
        }

        // Поиск пользователя по login
        const selectQuery = `
            SELECT c.client_id, c.first_name, c.last_name, c.phone, c.email, 
                   c.login, c.password_hash, c.role_id, r.role_name
            FROM clients c
            JOIN roles r ON c.role_id = r.role_id
            WHERE c.login = $1
        `;
        
        const result = await query(selectQuery, [login]);

        if (result.rowCount === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid login or password'
            });
        }

        const user = result.rows[0];

        // Проверка пароля
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid login or password'
            });
        }

        // Генерация JWT токена
        const tokenPayload = {
            client_id: user.client_id,
            login: user.login,
            role: user.role_name,
            role_id: user.role_id
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                expires_in: JWT_EXPIRES_IN,
                user: {
                    client_id: user.client_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone: user.phone,
                    email: user.email,
                    login: user.login,
                    role: user.role_name
                }
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Получение профиля текущего пользователя
 * GET /api/auth/profile
 */
async function getProfile(req, res) {
    try {
        const client_id = req.user.client_id;

        const selectQuery = `
            SELECT c.client_id, c.first_name, c.last_name, c.phone, c.email, 
                   c.login, c.role_id, r.role_name, c.created_at
            FROM clients c
            JOIN roles r ON c.role_id = r.role_id
            WHERE c.client_id = $1
        `;

        const result = await query(selectQuery, [client_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Get profile error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

module.exports = { register, login, getProfile };
