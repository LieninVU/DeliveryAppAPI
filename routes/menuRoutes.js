const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

/**
 * @route GET /api/menu
 * @description Получение всего меню с фильтрами
 * @query {string} category - Фильтр по категории (Pizza, Sushi, etc.)
 * @query {boolean} available - Фильтр по доступности
 * @access Public
 */
router.get('/', menuController.getMenu);

/**
 * @route GET /api/menu/categories
 * @description Получение всех категорий
 * @access Public
 */
router.get('/categories', menuController.getCategories);

/**
 * @route GET /api/menu/:id
 * @description Получение блюда по ID
 * @access Public
 */
router.get('/:id', menuController.getDishById);

module.exports = router;
