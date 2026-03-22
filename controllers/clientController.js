const { query } = require('../db');

/**
 * Получение всех клиентов (Admin only)
 * GET /api/admin/clients
 */
async function getClients(req, res) {
    try {
        const sql = 'SELECT client_id, first_name, last_name, phone, email, login, role_id, created_at FROM clients ORDER BY client_id';
        
        const result = await query(sql);
        
        res.status(200).json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });
    } catch (err) {
        console.error('Get clients error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Получение клиента по ID
 * GET /api/admin/clients/:id
 */
async function getClient(req, res) {
    try {
        const { id } = req.params;
        
        const sql = `
            SELECT c.client_id, c.first_name, c.last_name, c.phone, c.email, c.login, c.role_id, r.role_name, c.created_at
            FROM clients c
            JOIN roles r ON c.role_id = r.role_id
            WHERE c.client_id = $1
        `;
        
        const result = await query(sql, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Get client error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

module.exports = { getClients, getClient };
