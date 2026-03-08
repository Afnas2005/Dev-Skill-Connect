"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const settingController_1 = require("../controllers/settingController");
const settingValidation_1 = require("../validations/settingValidation");
const router = express_1.default.Router();
router.get("/me", auth_1.authMiddleware, settingController_1.getMySettings);
router.put("/me", auth_1.authMiddleware, (0, validate_1.validate)(settingValidation_1.updateSettingsSchema), settingController_1.updateMySettings);
router.delete("/me", auth_1.authMiddleware, settingController_1.deleteMyAccount);
exports.default = router;
