import multer from "multer";

const badRequestError = (message: string) => {
    const error = new Error(message) as Error & { statusCode?: number };
    error.statusCode = 400;
    return error;
};

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        return callback(null, true);
    }

    return callback(badRequestError("Only image uploads are allowed"));
};

const skillAttachmentFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
    const allowed =
        file.mimetype.startsWith("image/") || file.mimetype === "application/pdf";
    if (allowed) {
        return callback(null, true);
    }

    return callback(badRequestError("Only PDF/PNG/JPG attachments are allowed"));
};

const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024,
    },
}).single("file");

export const uploadMultipleImages = multer({
    storage,
    fileFilter: skillAttachmentFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5,
    },
}).array("files", 5);

const postScreenshotFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
        return callback(null, true);
    }
    return callback(badRequestError("Only image screenshots are allowed"));
};

const postAttachmentFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
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
        return callback(
            badRequestError("Only ZIP, PDF, JSON, TXT and video files are allowed")
        );
    }
    if (allowedMimeTypes.includes(file.mimetype)) {
        return callback(null, true);
    }
    return callback(badRequestError("Only ZIP, PDF, JSON, TXT and video files are allowed"));
};

export const uploadPostScreenshots = multer({
    storage,
    fileFilter: postScreenshotFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 6,
    },
}).array("files", 6);

export const uploadPostFiles = multer({
    storage,
    fileFilter: postAttachmentFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 5,
    },
}).array("files", 5);

const resumeFileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
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

export const uploadResume = multer({
    storage,
    fileFilter: resumeFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
}).single("file");
