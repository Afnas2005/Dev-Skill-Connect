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
exports.getFeedPosts = exports.getMyPosts = exports.createPost = void 0;
const response_1 = require("../utils/response");
const postService = __importStar(require("../services/postService"));
const createPost = async (req, res, next) => {
    try {
        const result = await postService.createPost(req.user.userId, req.body);
        return (0, response_1.sendResponse)(res, 201, true, "Post created successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.createPost = createPost;
const getMyPosts = async (req, res, next) => {
    try {
        const result = await postService.getMyPosts(req.user.userId);
        return (0, response_1.sendResponse)(res, 200, true, "Posts fetched successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.getMyPosts = getMyPosts;
const getFeedPosts = async (req, res, next) => {
    try {
        const result = await postService.getFeedPosts();
        return (0, response_1.sendResponse)(res, 200, true, "Feed posts fetched successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.getFeedPosts = getFeedPosts;
