const { query, transaction } = require('../db');

/**
 * Оформление нового заказа
 * POST /api/orders
 * Body: { items: [{ dishId, quantity }], delivery_address, delivery_phone }
 * Auth: Required (JWT)
 */
async function createOrder(req, res) {
    try {
        const client_id = req.user.client_id;
        const { items, delivery_address, delivery_phone } = req.body;

        // Валидация
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Order must contain at least one item'
            });
        }

        if (!delivery_address || !delivery_phone) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: delivery_address, delivery_phone'
            });
        }

        // Валидация каждой позиции заказа
        for (const item of items) {
            if (!item.dishId || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Each item must have dishId and positive quantity'
                });
            }
        }

        // Транзакция: создание заказа + позиций
        const result = await transaction(async (client) => {
            // 1. Проверяем существование блюд и получаем цены
            const dishIds = items.map(item => Number(item.dishId));
            const placeholders = dishIds.map((_, i) => `$${i + 1}::int`).join(',');

            const dishesQuery = `
                SELECT dish_id, price, is_available
                FROM dishes
                WHERE dish_id IN (${placeholders})
            `;

            const dishesResult = await client.query(dishesQuery, dishIds);

            if (dishesResult.rowCount !== dishIds.length) {
                throw new Error('One or more dishes not found');
            }

            const dishesMap = new Map(dishesResult.rows.map(d => [d.dish_id, d]));

            // Проверяем доступность блюд
            for (const item of items) {
                const dish = dishesMap.get(item.dishId);
                if (!dish.is_available) {
                    throw new Error(`Dish ${item.dishId} is not available`);
                }
            }

            // 2. Считаем общую сумму
            let total_amount = 0;
            for (const item of items) {
                const dish = dishesMap.get(item.dishId);
                total_amount += Number(dish.price) * Number(item.quantity);
            }

            // 3. Создаем заказ
            const orderQuery = `
                INSERT INTO orders (client_id, status, total_amount, delivery_address, delivery_phone)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING order_id, client_id, status, total_amount, delivery_address, delivery_phone, created_at
            `;

            const orderResult = await client.query(orderQuery, [
                Number(client_id),
                'new',
                String(total_amount),
                String(delivery_address),
                String(delivery_phone)
            ]);

            const order = orderResult.rows[0];

            // 4. Создаем позиции заказа
            const orderItemsValues = [];
            const orderItemsPlaceholders = [];
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const dish = dishesMap.get(item.dishId);
                const baseIndex = i * 4;
                
                orderItemsPlaceholders.push(
                    `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`
                );
                orderItemsValues.push(
                    Number(order.order_id),
                    Number(item.dishId),
                    Number(item.quantity),
                    String(dish.price)
                );
            }

            const orderItemsQuery = `
                INSERT INTO order_items (order_id, dish_id, quantity, price_at_order)
                VALUES ${orderItemsPlaceholders.join(',')}
                RETURNING order_item_id, order_id, dish_id, quantity, price_at_order
            `;

            const orderItemsResult = await client.query(orderItemsQuery, orderItemsValues);

            return {
                order,
                order_items: orderItemsResult.rows
            };
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: result
        });

    } catch (err) {
        console.error('Create order error:', err.message);
        
        // Обработка ошибок транзакции
        if (err.message.includes('not found') || err.message.includes('not available')) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Получение заказа по ID
 * GET /api/orders/:id
 * Auth: Required (JWT) - только владелец может видеть заказ
 */
async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        const currentUserId = req.user.client_id;

        const sql = `
            SELECT 
                o.order_id,
                o.client_id,
                o.status,
                o.total_amount,
                o.delivery_address,
                o.delivery_phone,
                o.created_at,
                o.updated_at,
                json_agg(json_build_object(
                    'order_item_id', oi.order_item_id,
                    'dish_id', oi.dish_id,
                    'dish_name', d.dish_name,
                    'quantity', oi.quantity,
                    'price_at_order', oi.price_at_order
                )) FILTER (WHERE oi.order_item_id IS NOT NULL) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN dishes d ON oi.dish_id = d.dish_id
            WHERE o.order_id = $1
            GROUP BY o.order_id
        `;

        const result = await query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const order = result.rows[0];

        // Проверка: только владелец заказа может его видеть
        if (order.client_id !== currentUserId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only view your own orders'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (err) {
        console.error('Get order by ID error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Получение всех заказов текущего пользователя
 * GET /api/orders/my
 * Auth: Required (JWT)
 */
async function getMyOrders(req, res) {
    try {
        const client_id = req.user.client_id;

        const sql = `
            SELECT 
                o.order_id,
                o.status,
                o.total_amount,
                o.delivery_address,
                o.delivery_phone,
                o.created_at,
                o.updated_at,
                COUNT(oi.order_item_id) as items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.client_id = $1
            GROUP BY o.order_id
            ORDER BY o.created_at DESC
        `;

        const result = await query(sql, [client_id]);

        res.status(200).json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });

    } catch (err) {
        console.error('Get my orders error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Отмена заказа (только статус 'new')
 * PATCH /api/orders/:id/cancel
 * Auth: Required (JWT)
 */
async function cancelOrder(req, res) {
    try {
        const { id } = req.params;
        const client_id = req.user.client_id;

        // Сначала проверяем заказ и его статус
        const checkQuery = `
            SELECT order_id, client_id, status 
            FROM orders 
            WHERE order_id = $1
        `;
        
        const checkResult = await query(checkQuery, [id]);

        if (checkResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const order = checkResult.rows[0];

        // Проверка владельца
        if (order.client_id !== client_id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Можно отменить только новый заказ
        if (order.status !== 'new') {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel order with status '${order.status}'`
            });
        }

        // Обновляем статус
        const updateQuery = `
            UPDATE orders 
            SET status = 'cancelled'
            WHERE order_id = $1
            RETURNING order_id, status, updated_at
        `;

        const result = await query(updateQuery, [id]);

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Cancel order error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

module.exports = { createOrder, getOrderById, getMyOrders, cancelOrder };
