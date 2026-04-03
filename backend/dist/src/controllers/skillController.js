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
exports.getSkillsByUserId = exports.getMySkills = exports.deleteSkill = exports.updateSkill = exports.createSkill = void 0;
const response_1 = require("../utils/response");
const skillService = __importStar(require("../services/skillService"));
const createSkill = async (req, res, next) => {
    try {
        const result = await skillService.createSkill(req.user.userId, req.body);
        return (0, response_1.sendResponse)(res, 201, true, "Skill created successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.createSkill = createSkill;
const updateSkill = async (req, res, next) => {
    try {
        const result = await skillService.updateSkill(req.user.userId, String(req.params.id), req.body);
        return (0, response_1.sendResponse)(res, 200, true, "Skill updated successfully", result);
    }
    catch (error) {
        if (error.message === "Skill not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        if (error.message === "Forbidden") {
            return (0, response_1.sendResponse)(res, 403, false, "You can only edit your own skill");
        }
        return next(error);
    }
};
exports.updateSkill = updateSkill;
const deleteSkill = async (req, res, next) => {
    try {
        const result = await skillService.deleteSkill(req.user.userId, String(req.params.id));
        return (0, response_1.sendResponse)(res, 200, true, "Skill deleted successfully", result);
    }
    catch (error) {
        if (error.message === "Skill not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        if (error.message === "Forbidden") {
            return (0, response_1.sendResponse)(res, 403, false, "You can only delete your own skill");
        }
        return next(error);
    }
};
exports.deleteSkill = deleteSkill;
const getMySkills = async (req, res, next) => {
    try {
        const result = await skillService.getMySkills(req.user.userId);
        return (0, response_1.sendResponse)(res, 200, true, "Skills fetched successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.getMySkills = getMySkills;
const getSkillsByUserId = async (req, res, next) => {
    try {
        const result = await skillService.getSkillsByUserId(String(req.params.userId));
        return (0, response_1.sendResponse)(res, 200, true, "Public skills fetched successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.getSkillsByUserId = getSkillsByUserId;
