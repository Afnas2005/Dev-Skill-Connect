"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCloudinaryConfigured = exports.getCloudinaryConfigError = exports.isCloudinaryConfigured = void 0;
const cloudinary_1 = require("cloudinary");
const requiredVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];
const missingVars = requiredVars.filter((key) => !process.env[key]);
if (missingVars.length === 0) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}
const isCloudinaryConfigured = () => missingVars.length === 0;
exports.isCloudinaryConfigured = isCloudinaryConfigured;
const getCloudinaryConfigError = () => {
    if (missingVars.length === 0) {
        return null;
    }
    return `Cloudinary is not configured. Missing env vars: ${missingVars.join(", ")}`;
};
exports.getCloudinaryConfigError = getCloudinaryConfigError;
const assertCloudinaryConfigured = () => {
    const error = (0, exports.getCloudinaryConfigError)();
    if (!error) {
        return;
    }
    throw new Error(error);
};
exports.assertCloudinaryConfigured = assertCloudinaryConfigured;
exports.default = cloudinary_1.v2;
