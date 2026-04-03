"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const response_1 = require("../utils/response");
const isTargetSchemas = (schema) => {
    return (typeof schema === "object" &&
        schema !== null &&
        ("body" in schema || "params" in schema || "query" in schema));
};
const validateSection = (schema, payload, section) => {
    const { error, value } = schema.validate(payload, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (!error) {
        return { value };
    }
    return {
        error: error.details.map((detail) => `${section}: ${detail.message}`),
    };
};
const validate = (schema) => {
    return (req, res, next) => {
        if (!isTargetSchemas(schema)) {
            const result = validateSection(schema, req.body, "body");
            if (result.error) {
                return (0, response_1.sendResponse)(res, 400, false, "Validation failed", result.error);
            }
            req.body = result.value;
            return next();
        }
        const errors = [];
        if (schema.body) {
            const bodyResult = validateSection(schema.body, req.body, "body");
            if (bodyResult.error) {
                errors.push(...bodyResult.error);
            }
            else {
                req.body = bodyResult.value;
            }
        }
        if (schema.params) {
            const paramsResult = validateSection(schema.params, req.params, "params");
            if (paramsResult.error) {
                errors.push(...paramsResult.error);
            }
            else {
                req.params = paramsResult.value;
            }
        }
        if (schema.query) {
            const queryResult = validateSection(schema.query, req.query, "query");
            if (queryResult.error) {
                errors.push(...queryResult.error);
            }
            else {
                const queryRef = req.query;
                Object.keys(queryRef).forEach((key) => {
                    delete queryRef[key];
                });
                Object.assign(queryRef, queryResult.value);
            }
        }
        if (errors.length > 0) {
            return (0, response_1.sendResponse)(res, 400, false, "Validation failed", errors);
        }
        next();
    };
};
exports.validate = validate;
