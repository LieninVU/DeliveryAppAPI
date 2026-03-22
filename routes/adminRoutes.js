const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Все роуты требуют аутентификации и роли admin
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

/**
 * @route GET /api/admin/clients
 * @description Получение всех клиентов (только admin)
 * @access Admin only
 */
router.get('/clients', clientController.getClients);

/**
 * @route GET /api/admin/clients/:id
 * @description Получение клиента по ID (только admin)
 * @access Admin only
 */
router.get('/clients/:id', clientController.getClient);

module.exports = router;
