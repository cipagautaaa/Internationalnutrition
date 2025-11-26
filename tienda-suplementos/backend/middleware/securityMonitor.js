const redis = require('redis');
const { promisify } = require('util');

// Crear cliente Redis
const redisClient = redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379');
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

class SecurityMonitor {
    constructor() {
        // Configuración de umbrales
        this.thresholds = {
            loginAttempts: 5,        // Máximo de intentos de login fallidos
            requestsPerMinute: 100,   // Máximo de solicitudes por minuto
            concurrent: 20           // Máximo de solicitudes concurrentes
        };

        // Tiempo de bloqueo (en segundos)
        this.blockDuration = 15 * 60; // 15 minutos

        // Patrones sospechosos en solicitudes
        this.suspiciousPatterns = [
            /\.\.[\/\\]/,           // Directory traversal
            /<script>/i,            // XSS básico
            /(\%27)|(\')/i,        // SQL Injection básica
            /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i, // XSS más complejo
            /exec(\s|\+)+(s|x)p/i,  // SQL Exec
        ];
    }

    async trackIP(ip) {
        const key = `ip:${ip}:requests`;
        const current = await getAsync(key) || 0;
        await setAsync(key, parseInt(current) + 1, 'EX', 60);
        return parseInt(current) + 1;
    }

    async isIPBlocked(ip) {
        const key = `ip:${ip}:blocked`;
        return await getAsync(key) === 'true';
    }

    async blockIP(ip, reason) {
        const key = `ip:${ip}:blocked`;
        await setAsync(key, 'true', 'EX', this.blockDuration);
        
        // Registrar el bloqueo
        console.log(`IP ${ip} blocked for ${reason}`);
        
        // Guardar en la base de datos para análisis
        await this.logBlockedIP(ip, reason);
    }

    async logBlockedIP(ip, reason) {
        const blockLog = {
            ip,
            reason,
            timestamp: new Date(),
            duration: this.blockDuration
        };

        // Aquí podrías guardar en MongoDB o enviar a un servicio de logging
        console.log('Block logged:', blockLog);
    }

    isSuspiciousRequest(req) {
        // Verificar patrones sospechosos en la URL
        const url = req.url.toLowerCase();
        
        // Verificar headers sospechosos
        const headers = Object.keys(req.headers).map(h => h.toLowerCase());
        
        // Verificar patrones en el body si existe
        const body = req.body ? JSON.stringify(req.body).toLowerCase() : '';

        return this.suspiciousPatterns.some(pattern => {
            return pattern.test(url) || pattern.test(body);
        });
    }

    async monitorMiddleware(req, res, next) {
        const ip = req.ip || req.connection.remoteAddress;

        try {
            // Verificar si la IP está bloqueada
            if (await this.isIPBlocked(ip)) {
                return res.status(403).json({
                    error: 'Access Denied',
                    message: 'Your IP has been temporarily blocked due to suspicious activity'
                });
            }

            // Contar solicitudes por IP
            const requests = await this.trackIP(ip);
            
            // Verificar límites
            if (requests > this.thresholds.requestsPerMinute) {
                await this.blockIP(ip, 'Too many requests');
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Please try again later'
                });
            }

            // Verificar contenido sospechoso
            if (this.isSuspiciousRequest(req)) {
                await this.blockIP(ip, 'Suspicious request pattern');
                return res.status(403).json({
                    error: 'Access Denied',
                    message: 'Suspicious activity detected'
                });
            }

            next();
        } catch (error) {
            console.error('Security monitor error:', error);
            next(error);
        }
    }
}

const securityMonitor = new SecurityMonitor();

module.exports = {
    securityMonitor,
    monitorMiddleware: (req, res, next) => securityMonitor.monitorMiddleware(req, res, next)
};