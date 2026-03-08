"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToConnectionRequest = exports.connectWithUser = exports.searchSkills = void 0;
const response_1 = require("../utils/response");
const searchService = __importStar(require("../services/searchService"));
const searchSkills = async (req, res, next) => {
    try {
        const result = await searchService.searchSkills({
            skill: req.query.skill,
            level: req.query.level,
            viewerId: req.user?.userId,
        });
        return (0, response_1.sendResponse)(res, 200, true, "Search results fetched successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.searchSkills = searchSkills;
const connectWithUser = async (req, res, next) => {
    try {
        const result = await searchService.sendConnectionRequest(req.user.userId, String(req.params.userId));
        return (0, response_1.sendResponse)(res, 201, true, "Connection request sent", result);
    }
    catch (error) {
        if (error.message === "You cannot connect with yourself" ||
            error.message === "User not found" ||
            error.message === "Already connected" ||
            error.message === "Connection request already sent") {
            return (0, response_1.sendResponse)(res, 400, false, error.message);
        }
        return next(error);
    }
};
exports.connectWithUser = connectWithUser;
const respondToConnectionRequest = async (req, res, next) => {
    try {
        const result = await searchService.respondToConnectionRequest(req.user.userId, String(req.params.userId), req.body.action);
        return (0, response_1.sendResponse)(res, 200, true, "Connection request updated", result);
    }
    catch (error) {
        if (error.message === "Connection request not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        return next(error);
    }
};
exports.respondToConnectionRequest = respondToConnectionRequest;
