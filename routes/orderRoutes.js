const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Все роуты заказов требуют аутентификации
router.use(authMiddleware);

/**
 * @route POST /api/orders
 * @description Оформление нового заказа
 * @body {array} items - Массив товаров [{dishId, quantity}]
 * @body {string} delivery_address - Адрес доставки
 * @body {string} delivery_phone - Телефон для доставки
 * @access Private (JWT required)
 */
router.post('/', orderController.createOrder);

/**
 * @route GET /api/orders/my
 * @description Получение всех заказов текущего пользователя
 * @access Private (JWT required)
 */
router.get('/my', orderController.getMyOrders);

/**
 * @route GET /api/orders/:id
 * @description Получение заказа по ID (только владелец или admin)
 * @access Private (JWT required)
 */
router.get('/:id', orderController.getOrderById);

/**
 * @route PATCH /api/orders/:id/cancel
 * @description Отмена заказа (только статус 'new')
 * @access Private (JWT required)
 */
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
