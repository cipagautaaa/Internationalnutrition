const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

// Configuración del rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana por IP
});

// Middleware de seguridad
const securityMiddleware = (app) => {
    // Protección básica con helmet
    app.use(helmet());

    // Configurar CSP (Content Security Policy)
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.wompi.co"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.wompi.co"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://checkout.wompi.co", "https://www.google.com"]
        }
    }));

    // Protección XSS adicional
    app.use(helmet.xssFilter());

    // Prevenir MIME sniffing
    app.use(helmet.noSniff());

    // Configurar CORS
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, CSRF-Token');
        res.header('Access-Control-Allow-Credentials', true);
        next();
    });

    // Protección CSRF
    app.use(csrf({ cookie: true }));

    // Rate limiting
    app.use('/api/', limiter);

    // Error handler para CSRF
    app.use((err, req, res, next) => {
        if (err.code === 'EBADCSRFTOKEN') {
            return res.status(403).json({
                error: 'Sesión invalidada',
                message: 'La sesión ha expirado o es inválida. Por favor, recargue la página.'
            });
        }
        next(err);
    });
};

module.exports = securityMiddleware;