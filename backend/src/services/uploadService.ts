import cloudinary, {
    getCloudinaryConfigError,
    isCloudinaryConfigured,
} from "../config/cloudinary";
import path from "path";

type UploadFolder =
    | "profile-images"
    | "skill-attachments"
    | "post-screenshots"
    | "post-files"
    | "resumes"
    | "voice-notes";
type UploadFile = {
    buffer: Buffer;
    mimetype: string;
    originalname?: string;
};

const toDataUri = (file: UploadFile) => {
    const base64 = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64}`;
};

const toSafeExt = (mimetype: string, originalname?: string) => {
    if (mimetype === "application/zip" || mimetype === "application/x-zip-compressed") return "zip";
    if (mimetype === "application/pdf") return "pdf";
    if (mimetype === "application/json") return "json";
    if (mimetype === "text/plain") return "txt";
    if (mimetype === "application/msword") return "doc";
    if (
        mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
        return "docx";
    if (mimetype === "application/octet-stream" && originalname) {
        const ext = path.extname(originalname).replace(".", "").toLowerCase();
        if (["zip", "pdf", "json", "txt", "doc", "docx", "webm", "mp3", "m4a", "ogg", "wav"].includes(ext)) {
            return ext;
        }
    }
    if (mimetype === "audio/webm") return "webm";
    if (mimetype === "audio/mpeg") return "mp3";
    if (mimetype === "audio/mp4") return "m4a";
    if (mimetype === "audio/ogg") return "ogg";
    if (mimetype === "audio/wav" || mimetype === "audio/x-wav") return "wav";
    if (mimetype === "image/png") return "png";
    if (mimetype === "image/webp") return "webp";
    if (mimetype === "image/gif") return "gif";
    return "jpg";
};

export const uploadSingleFile = async (
    file: UploadFile,
    folder: UploadFolder
) => {
    if (!isCloudinaryConfigured()) {
        const error = new Error(getCloudinaryConfigError() || "Cloudinary is not configured") as Error & {
            statusCode?: number;
        };
        error.statusCode = 500;
        throw error;
    }

    if (file.mimetype.startsWith("image/")) {
        const resource = await cloudinary.uploader.upload(toDataUri(file), {
            folder: `devskill-connect/${folder}`,
            resource_type: "image",
        });
        return resource.secure_url;
    }

    const ext = toSafeExt(file.mimetype, file.originalname);
    const publicId = `${Date.now()}-${Date.now().toString()}.${ext}`;

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: `devskill-connect/${folder}`,
                resource_type: "raw",
                public_id: publicId,
            },
            (error, resource) => {
                if (error || !resource) {
                    return reject(error || new Error("Failed to upload file"));
                }
                resolve(resource as { secure_url: string });
            }
        );
        stream.end(file.buffer);
    });

    return result.secure_url;
};

export const uploadMultipleFiles = async (
    files: UploadFile[],
    folder: UploadFolder
) => {
    const uploaded = await Promise.all(
        files.map((file) => uploadSingleFile(file, folder))
    );

    return uploaded;
};
