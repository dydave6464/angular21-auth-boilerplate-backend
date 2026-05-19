require('rootpath')();
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const errorHandler = require('./_middleware/error-handler');

const app = express();

// Render runs behind a proxy; req.ip relies on this being set.
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS — must be a specific origin (no '*') because we send credentials.
// CORS_ORIGIN can be a single origin or a comma-separated list (e.g. prod + localhost dev).
const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // allow non-browser requests (curl, server-to-server) with no Origin header
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true,
    })
);

// API routes
app.use('/accounts', require('./accounts/accounts.controller'));

// Swagger docs
app.use('/api-docs', require('./_helpers/swagger'));

// global error handler
app.use(errorHandler);

const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, () => console.log(`Server listening on port ${port}`));
