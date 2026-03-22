const { query } = require('../db');

/**
 * Получение всего меню с категориями
 * GET /api/menu
 * Query params: category (optional), available (optional)
 */
async function getMenu(req, res) {
    try {
        const { category, available } = req.query;

        let sql = `
            SELECT 
                d.dish_id,
                d.dish_name,
                d.description,
                d.price,
                d.is_available,
                d.image_url,
                c.category_name,
                c.category_id
            FROM dishes d
            JOIN categories c ON d.category_id = c.category_id
            WHERE 1=1
        `;

        const values = [];
        let paramIndex = 1;

        // Фильтр по категории
        if (category) {
            sql += ` AND c.category_name ILIKE $${paramIndex}`;
            values.push(`%${category}%`);
            paramIndex++;
        }

        // Фильтр по доступности
        if (available !== undefined) {
            const isAvailable = available === 'true' || available === '1';
            sql += ` AND d.is_available = $${paramIndex}`;
            values.push(isAvailable);
            paramIndex++;
        }

        sql += ' ORDER BY c.category_name, d.dish_name';

        const result = await query(sql, values);

        res.status(200).json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });

    } catch (err) {
        console.error('Get menu error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Получение блюда по ID
 * GET /api/menu/:id
 */
async function getDishById(req, res) {
    try {
        const { id } = req.params;

        const sql = `
            SELECT 
                d.dish_id,
                d.dish_name,
                d.description,
                d.price,
                d.is_available,
                d.image_url,
                c.category_name,
                c.category_id
            FROM dishes d
            JOIN categories c ON d.category_id = c.category_id
            WHERE d.dish_id = $1
        `;

        const result = await query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Dish not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Get dish by ID error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Получение всех категорий
 * GET /api/menu/categories
 */
async function getCategories(req, res) {
    try {
        const sql = 'SELECT category_id, category_name, description FROM categories ORDER BY category_name';
        const result = await query(sql);

        res.status(200).json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });

    } catch (err) {
        console.error('Get categories error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

module.exports = { getMenu, getDishById, getCategories };
