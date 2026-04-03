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
exports.uploadVoiceNote = exports.uploadResume = exports.uploadPostFiles = exports.uploadPostScreenshots = exports.uploadSkillAttachments = exports.uploadProfileImage = void 0;
const response_1 = require("../utils/response");
const uploadService = __importStar(require("../services/uploadService"));
const uploadProfileImage = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return (0, response_1.sendResponse)(res, 400, false, "Profile image file is required");
        }
        const url = await uploadService.uploadSingleFile(file, "profile-images");
        return (0, response_1.sendResponse)(res, 200, true, "Profile image uploaded successfully", {
            url,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.uploadProfileImage = uploadProfileImage;
const uploadSkillAttachments = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return (0, response_1.sendResponse)(res, 400, false, "At least one attachment file is required");
        }
        const urls = await uploadService.uploadMultipleFiles(files, "skill-attachments");
        return (0, response_1.sendResponse)(res, 200, true, "Skill attachments uploaded successfully", {
            urls,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.uploadSkillAttachments = uploadSkillAttachments;
const uploadPostScreenshots = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return (0, response_1.sendResponse)(res, 400, false, "At least one screenshot file is required");
        }
        const urls = await uploadService.uploadMultipleFiles(files, "post-screenshots");
        return (0, response_1.sendResponse)(res, 200, true, "Post screenshots uploaded successfully", {
            urls,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.uploadPostScreenshots = uploadPostScreenshots;
const uploadPostFiles = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return (0, response_1.sendResponse)(res, 400, false, "At least one attachment file is required");
        }
        const urls = await uploadService.uploadMultipleFiles(files, "post-files");
        return (0, response_1.sendResponse)(res, 200, true, "Post files uploaded successfully", {
            urls,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.uploadPostFiles = uploadPostFiles;
const uploadResume = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return (0, response_1.sendResponse)(res, 400, false, "Resume file is required");
        }
        const url = await uploadService.uploadSingleFile(file, "resumes");
        return (0, response_1.sendResponse)(res, 200, true, "Resume uploaded successfully", {
            url,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.uploadResume = uploadResume;
const uploadVoiceNote = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return (0, response_1.sendResponse)(res, 400, false, "Voice note file is required");
        }
        const url = await uploadService.uploadSingleFile(file, "voice-notes");
        return (0, response_1.sendResponse)(res, 200, true, "Voice note uploaded successfully", {
            url,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.uploadVoiceNote = uploadVoiceNote;
