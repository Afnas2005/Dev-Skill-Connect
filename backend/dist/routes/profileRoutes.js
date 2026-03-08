"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const profileValidation_1 = require("../validations/profileValidation");
const router = express_1.default.Router();
router.get("/me", auth_1.authMiddleware, profileController_1.getMyProfile);
router.put("/me", auth_1.authMiddleware, (0, validate_1.validate)(profileValidation_1.profileUpdateSchema), profileController_1.updateMyProfile);
router.get("/:userId", (0, validate_1.validate)({ params: profileValidation_1.userIdParamSchema }), profileController_1.getPublicProfile);
exports.default = router;
