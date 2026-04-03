import { v2 as cloudinary } from "cloudinary";

const requiredVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
] as const;

const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length === 0) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

export const isCloudinaryConfigured = () => missingVars.length === 0;

export const getCloudinaryConfigError = () => {
    if (missingVars.length === 0) {
        return null;
    }

    return `Cloudinary is not configured. Missing env vars: ${missingVars.join(", ")}`;
};

export const assertCloudinaryConfigured = () => {
    const error = getCloudinaryConfigError();
    if (!error) {
        return;
    }

    throw new Error(error);
};

export default cloudinary;
