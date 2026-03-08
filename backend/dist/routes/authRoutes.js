"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const authValidation_1 = require("../validations/authValidation");
const router = express_1.default.Router();
router.post("/register", (0, validate_1.validate)(authValidation_1.registerSchema), authController_1.register);
router.post("/login", (0, validate_1.validate)(authValidation_1.loginSchema), authController_1.login);
router.post("/google", authController_1.googleAuth);
router.get("/me", auth_1.authMiddleware, authController_1.getMe);
router.put("/profile", auth_1.authMiddleware, (0, validate_1.validate)(authValidation_1.profileUpdateSchema), authController_1.updateProfile);
router.post("/logout", authController_1.logout);
exports.default = router;
