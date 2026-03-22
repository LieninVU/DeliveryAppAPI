const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route POST /api/auth/register
 * @description Регистрация нового пользователя
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @description Логин и получение JWT токена
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/profile
 * @description Получение профиля текущего пользователя
 * @access Private (JWT required)
 */
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
