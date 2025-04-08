import { NextFunction, Request, Response } from "express";

enum ErrorType {
    CONFLICT = 'CONFLICT',
    MISSING_PARAMETERS = 'MISSING_PARAMETERS',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}

interface hasPropertiesOptions {
    allOf?: string[];
    anyOf?: string[];
}

function hasProperties({ allOf, anyOf }: hasPropertiesOptions) {
    return function (req: Request, res: Response, next: NextFunction) {
        /* find missing properties */
        const missingAllOf = allOf && (!req.body || !hasAllOf(req.body, ...allOf));
        const missingAnyOf = anyOf && (!req.body || !hasAnyOf(req.body, ...anyOf));
        if (missingAllOf && missingAnyOf) {
            /* send 400 Bad Request */
            res.status(400).json({ type: ErrorType.MISSING_PARAMETERS });
        } else {
            next();
        }
    }
}

function hasAllOf(obj: Record<string, any>, ...keys: string[]) {
    for (const key of keys) {
        if (obj[key] == null) {
            return false;
        }
    }
    return true;
}

function hasAnyOf(obj: Record<string, any>, ...keys: string[]) {
    for (const key of keys) {
        if (obj[key] != null) {
            return true;
        }
    }
    return false;
}

export { ErrorType, hasProperties };