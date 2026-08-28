"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const store_1 = require("../database/store");
const roleMiddleware = (requiredRoles) => {
    return (req, res, next) => {
        const role = req.headers['x-user-role'];
        // Log the access attempt
        store_1.db.logAccess(role || 'anonymous', req.originalUrl);
        if (!role || !requiredRoles.includes(role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
