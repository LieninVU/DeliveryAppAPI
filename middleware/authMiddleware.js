const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки JWT токена
 * Извлекает токен из заголовка Authorization: Bearer <token>
 * Добавляет decoded payload в req.user
 */
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header is required'
            });
        }

        const [scheme, token] = authHeader.split(' ');
        
        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authorization format. Use: Bearer <token>'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token has expired'
            });
        }
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }

        console.error('Auth middleware error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Middleware для проверки роли пользователя
 * @param {string|string[]} allowedRoles - Разрешенные роли (строка или массив)
 */
function roleMiddleware(allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!rolesArray.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions'
            });
        }

        next();
    };
}

module.exports = { authMiddleware, roleMiddleware };
