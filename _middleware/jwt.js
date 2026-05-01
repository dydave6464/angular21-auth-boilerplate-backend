const { expressjwt: jwt } = require('express-jwt');
const db = require('../_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // 1) authenticate JWT and attach req.auth
        jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }),

        // 2) attach the full account, then enforce role restrictions
        async (req, res, next) => {
            const account = await db.Account.findByPk(req.auth.id);
            if (!account) return res.status(401).json({ message: 'Unauthorized' });

            if (roles.length && !roles.includes(account.role)) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // attach refresh tokens for the current account so the controller can use them
            req.user = account.get();
            const refreshTokens = await account.getRefreshTokens();
            req.user.ownsToken = (token) => !!refreshTokens.find((x) => x.token === token);
            next();
        },
    ];
}
