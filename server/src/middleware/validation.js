const { schemas } = require('../config/schema');
const { isValidHttpUrl } = require('../utils/strings');

function validateField(key, value, fieldDef) {
    if (value === null || value === undefined) {
        return null;
    }

    switch (fieldDef.type) {
        case 'text':
            if (typeof value !== 'string' || !value.trim()) {
                return `${key} must be a non-empty string`;
            }
            if (fieldDef.check && !fieldDef.check.includes(value)) {
                return `${key} must be one of: ${fieldDef.check.join(', ')}`;
            }
            if (fieldDef.url && !isValidHttpUrl(value)) {
                return `${key} must be a valid http/https URL`;
            }
            return null;
        case 'boolean':
            return typeof value === 'boolean' ? null : `${key} must be a boolean`;
        case 'int':
            return Number.isInteger(value) ? null : `${key} must be an integer`;
        case 'timestamp':
            if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
                return `${key} must be a valid timestamp`;
            }
            return null;
        case 'array':
            if (!Array.isArray(value)) {
                return `${key} must be an array`;
            }

            if (fieldDef.itemType === 'text') {
                const invalid = value.find((item) => typeof item !== 'string' || !item.trim());
                return invalid === undefined ? null : `${key} must only contain non-empty strings`;
            }

            if (fieldDef.itemType === 'object') {
                for (const item of value) {
                    if (!item || typeof item !== 'object' || Array.isArray(item)) {
                        return `${key} must only contain objects`;
                    }

                    for (const [shapeKey, shapeDef] of Object.entries(fieldDef.itemShape || {})) {
                        const nestedValue = item[shapeKey];

                        if (shapeDef.required && (nestedValue === null || nestedValue === undefined || nestedValue === '')) {
                            return `${key}.${shapeKey} is required`;
                        }

                        if (nestedValue !== undefined) {
                            const nestedError = validateField(`${key}.${shapeKey}`, nestedValue, shapeDef);
                            if (nestedError) {
                                return nestedError;
                            }
                        }
                    }
                }
            }

            return null;
        default:
            return null;
    }
}

function validateBody(schemaName, mode = 'create') {
    const schemaDef = schemas[schemaName];

    if (!schemaDef) {
        throw new Error(`Unknown schema: ${schemaName}`);
    }

    return (req, res, next) => {
        const body = req.body || {};
        const errors = [];
        const allowedFields = Object.keys(schemaDef.fields);

        for (const key of Object.keys(body)) {
            if (!allowedFields.includes(key)) {
                errors.push(`Unknown field: ${key}`);
            }
        }

        for (const [key, fieldDef] of Object.entries(schemaDef.fields)) {
            const value = body[key];

            if (mode === 'create' && fieldDef.required && (value === null || value === undefined || value === '')) {
                errors.push(`${key} is required`);
                continue;
            }

            if (value !== undefined) {
                const fieldError = validateField(key, value, fieldDef);
                if (fieldError) {
                    errors.push(fieldError);
                }
            }
        }

        if (errors.length) {
            return res.status(400).json({
                success: false,
                errors,
            });
        }

        next();
    };
}

function validateLogin(req, res, next) {
    const { username, password } = req.body || {};

    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Username and password are required.',
        });
    }

    next();
}

module.exports = {
    validateBody,
    validateLogin,
};
