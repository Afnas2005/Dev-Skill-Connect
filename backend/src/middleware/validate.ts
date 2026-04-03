import { Request, Response, NextFunction } from "express";
import { AnySchema } from "joi";
import { sendResponse } from "../utils/response";

type ValidateTargetSchemas = {
    body?: AnySchema;
    params?: AnySchema;
    query?: AnySchema;
};

const isTargetSchemas = (schema: AnySchema | ValidateTargetSchemas): schema is ValidateTargetSchemas => {
    return (
        typeof schema === "object" &&
        schema !== null &&
        ("body" in schema || "params" in schema || "query" in schema)
    );
};

const validateSection = (
    schema: AnySchema,
    payload: unknown,
    section: "body" | "params" | "query"
) => {
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

export const validate = (schema: AnySchema | ValidateTargetSchemas) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!isTargetSchemas(schema)) {
            const result = validateSection(schema, req.body, "body");
            if (result.error) {
                return sendResponse(res, 400, false, "Validation failed", result.error);
            }

            req.body = result.value;
            return next();
        }

        const errors: string[] = [];

        if (schema.body) {
            const bodyResult = validateSection(schema.body, req.body, "body");
            if (bodyResult.error) {
                errors.push(...bodyResult.error);
            } else {
                req.body = bodyResult.value;
            }
        }

        if (schema.params) {
            const paramsResult = validateSection(schema.params, req.params, "params");
            if (paramsResult.error) {
                errors.push(...paramsResult.error);
            } else {
                req.params = paramsResult.value;
            }
        }

        if (schema.query) {
            const queryResult = validateSection(schema.query, req.query, "query");
            if (queryResult.error) {
                errors.push(...queryResult.error);
            } else {
                const queryRef = req.query as Record<string, unknown>;
                Object.keys(queryRef).forEach((key) => {
                    delete queryRef[key];
                });
                Object.assign(queryRef, queryResult.value as Record<string, unknown>);
            }
        }

        if (errors.length > 0) {
            return sendResponse(res, 400, false, "Validation failed", errors);
        }

        next();
    };
};
