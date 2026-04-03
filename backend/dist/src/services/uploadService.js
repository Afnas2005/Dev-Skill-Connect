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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleFiles = exports.uploadSingleFile = void 0;
const cloudinary_1 = __importStar(require("../config/cloudinary"));
const path_1 = __importDefault(require("path"));
const toDataUri = (file) => {
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
};
const toSafeExt = (mimetype, originalname) => {
    if (mimetype === "application/zip" || mimetype === "application/x-zip-compressed")
        return "zip";
    if (mimetype === "application/pdf")
        return "pdf";
    if (mimetype === "application/json")
        return "json";
    if (mimetype === "text/plain")
        return "txt";
    if (mimetype === "application/msword")
        return "doc";
    if (mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        return "docx";
    if (mimetype === "application/octet-stream" && originalname) {
        const ext = path_1.default.extname(originalname).replace(".", "").toLowerCase();
        if (["zip", "pdf", "json", "txt", "doc", "docx", "webm", "mp3", "m4a", "ogg", "wav"].includes(ext)) {
            return ext;
        }
    }
    if (mimetype === "audio/webm")
        return "webm";
    if (mimetype === "audio/mpeg")
        return "mp3";
    if (mimetype === "audio/mp4")
        return "m4a";
    if (mimetype === "audio/ogg")
        return "ogg";
    if (mimetype === "audio/wav" || mimetype === "audio/x-wav")
        return "wav";
    if (mimetype === "image/png")
        return "png";
    if (mimetype === "image/webp")
        return "webp";
    if (mimetype === "image/gif")
        return "gif";
    return "jpg";
};
const uploadSingleFile = async (file, folder) => {
    if (!(0, cloudinary_1.isCloudinaryConfigured)()) {
        const error = new Error((0, cloudinary_1.getCloudinaryConfigError)() || "Cloudinary is not configured");
        error.statusCode = 500;
        throw error;
    }
    if (file.mimetype.startsWith("image/")) {
        const resource = await cloudinary_1.default.uploader.upload(toDataUri(file), {
            folder: `devskill-connect/${folder}`,
            resource_type: "image",
        });
        return resource.secure_url;
    }
    const ext = toSafeExt(file.mimetype, file.originalname);
    const publicId = `${Date.now()}-${Date.now().toString()}.${ext}`;
    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({
            folder: `devskill-connect/${folder}`,
            resource_type: "raw",
            public_id: publicId,
        }, (error, resource) => {
            if (error || !resource) {
                return reject(error || new Error("Failed to upload file"));
            }
            resolve(resource);
        });
        stream.end(file.buffer);
    });
    return result.secure_url;
};
exports.uploadSingleFile = uploadSingleFile;
const uploadMultipleFiles = async (files, folder) => {
    const uploaded = await Promise.all(files.map((file) => (0, exports.uploadSingleFile)(file, folder)));
    return uploaded;
};
exports.uploadMultipleFiles = uploadMultipleFiles;
