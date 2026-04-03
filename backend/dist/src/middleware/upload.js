"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVoiceNote = exports.uploadResume = exports.uploadPostFiles = exports.uploadPostScreenshots = exports.uploadMultipleImages = exports.uploadSingleImage = void 0;
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
        "video/mp4",
        "video/webm",
        "video/quicktime",
    ];
    if (file.mimetype === "application/octet-stream") {
        const lower = (file.originalname || "").toLowerCase();
        const allowedExt = [".zip", ".pdf", ".json", ".txt", ".mp4", ".mov", ".webm"];
        if (allowedExt.some((ext) => lower.endsWith(ext))) {
            return callback(null, true);
        }
        return callback(badRequestError("Only ZIP, PDF, JSON, TXT and video files are allowed"));
    }
    if (allowedMimeTypes.includes(file.mimetype)) {
        return callback(null, true);
    }
    return callback(badRequestError("Only ZIP, PDF, JSON, TXT and video files are allowed"));
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
const resumeFileFilter = (_req, file, callback) => {
    const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    ];
    if (file.mimetype === "application/octet-stream") {
        const lower = (file.originalname || "").toLowerCase();
        const allowedExt = [".pdf", ".doc", ".docx"];
        if (allowedExt.some((ext) => lower.endsWith(ext))) {
            return callback(null, true);
        }
        return callback(badRequestError("Only PDF, DOC or DOCX resumes are allowed"));
    }
    if (allowedMimeTypes.includes(file.mimetype)) {
        return callback(null, true);
    }
    return callback(badRequestError("Only PDF, DOC or DOCX resumes are allowed"));
};
exports.uploadResume = (0, multer_1.default)({
    storage,
    fileFilter: resumeFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
}).single("file");
const voiceNoteFilter = (_req, file, callback) => {
    const allowedMimeTypes = [
        "audio/webm",
        "audio/mpeg",
        "audio/mp4",
        "audio/ogg",
        "audio/wav",
        "audio/x-wav",
        "application/octet-stream",
    ];
    if (file.mimetype === "application/octet-stream") {
        const lower = (file.originalname || "").toLowerCase();
        const allowedExt = [".webm", ".mp3", ".m4a", ".ogg", ".wav"];
        if (allowedExt.some((ext) => lower.endsWith(ext))) {
            return callback(null, true);
        }
        return callback(badRequestError("Only WEBM, MP3, M4A, OGG or WAV audio is allowed"));
    }
    if (allowedMimeTypes.includes(file.mimetype)) {
        return callback(null, true);
    }
    return callback(badRequestError("Only WEBM, MP3, M4A, OGG or WAV audio is allowed"));
};
exports.uploadVoiceNote = (0, multer_1.default)({
    storage,
    fileFilter: voiceNoteFilter,
    limits: {
        fileSize: 15 * 1024 * 1024,
    },
}).single("file");
