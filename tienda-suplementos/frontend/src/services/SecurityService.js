// Servicio para manejar la seguridad en el frontend
const SecurityService = {
    // Obtener el token CSRF
    getCsrfToken: async () => {
        try {
            const response = await fetch('/csrf-token');
            const data = await response.json();
            return data.csrfToken;
        } catch (error) {
            console.error('Error obteniendo token CSRF:', error);
            return null;
        }
    },

    // Función para validar contraseñas
    validatePassword: (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            errors: {
                length: password.length < minLength,
                upperCase: !hasUpperCase,
                lowerCase: !hasLowerCase,
                numbers: !hasNumbers,
                specialChar: !hasSpecialChar
            }
        };
    },

    // Función para sanitizar inputs
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    // Función para verificar si una sesión está activa
    checkSession: async () => {
        try {
            const response = await fetch('/check-session', {
                credentials: 'include'
            });
            return response.ok;
        } catch (error) {
            console.error('Error verificando sesión:', error);
            return false;
        }
    },

    // Función para manejar el logout seguro
    secureLogout: async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Error en logout:', error);
            return false;
        }
    },

    // Función para verificar la fortaleza de la contraseña
    checkPasswordStrength: (password) => {
        let strength = 0;
        const feedback = [];

        if (password.length >= 8) {
            strength += 1;
        } else {
            feedback.push('La contraseña debe tener al menos 8 caracteres');
        }

        if (/[A-Z]/.test(password)) {
            strength += 1;
        } else {
            feedback.push('Debe incluir al menos una mayúscula');
        }

        if (/[a-z]/.test(password)) {
            strength += 1;
        } else {
            feedback.push('Debe incluir al menos una minúscula');
        }

        if (/[0-9]/.test(password)) {
            strength += 1;
        } else {
            feedback.push('Debe incluir al menos un número');
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            strength += 1;
        } else {
            feedback.push('Debe incluir al menos un carácter especial');
        }

        return {
            score: strength,
            feedback,
            isStrong: strength >= 4
        };
    }
};

export default SecurityService;