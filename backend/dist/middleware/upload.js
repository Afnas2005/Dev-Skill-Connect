"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPostFiles = exports.uploadPostScreenshots = exports.uploadMultipleImages = exports.uploadSingleImage = void 0;
const multer_1 = __importDefault(require("multer"));
const badRequestError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};
const imageFileFilter = (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        return callback(null, true);
    }
    return callback(badRequestError("Only image uploads are allowed"));
};
const skillAttachmentFilter = (_req, file, callback) => {
    const allowed = file.mimetype.startsWith("image/") || file.mimetype === "application/pdf";
    if (allowed) {
        return callback(null, true);
    }
    return callback(badRequestError("Only PDF/PNG/JPG attachments are allowed"));
};
const storage = multer_1.default.memoryStorage();
exports.uploadSingleImage = (0, multer_1.default)({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024,
    },
}).single("file");
exports.uploadMultipleImages = (0, multer_1.default)({
    storage,
    fileFilter: skillAttachmentFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5,
    },
}).array("files", 5);
const postScreenshotFilter = (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        return callback(null, true);
    }
    return callback(badRequestError("Only image screenshots are allowed"));
};
const postAttachmentFilter = (_req, file, callback) => {
    const allowedMimeTypes = [
        "application/zip",
        "application/x-zip-compressed",
        "application/pdf",
        "application/json",
        "text/plain",
        "application/octet-stream",
    ];
    if (file.mimetype === "application/octet-stream") {
        const lower = (file.originalname || "").toLowerCase();
        const allowedExt = [".zip", ".pdf", ".json", ".txt"];
        if (allowedExt.some((ext) => lower.endsWith(ext))) {
            return callback(null, true);
        }
        return callback(badRequestError("Only ZIP, PDF, JSON and TXT files are allowed"));
    }
    if (allowedMimeTypes.includes(file.mimetype)) {
        return callback(null, true);
    }
    return callback(badRequestError("Only ZIP, PDF, JSON and TXT files are allowed"));
};
exports.uploadPostScreenshots = (0, multer_1.default)({
    storage,
    fileFilter: postScreenshotFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 6,
    },
}).array("files", 6);
exports.uploadPostFiles = (0, multer_1.default)({
    storage,
    fileFilter: postAttachmentFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 5,
    },
}).array("files", 5);
