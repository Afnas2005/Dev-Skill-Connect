"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const skillController_1 = require("../controllers/skillController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const skillValidation_1 = require("../validations/skillValidation");
const router = express_1.default.Router();
router.post("/", auth_1.authMiddleware, (0, validate_1.validate)(skillValidation_1.createSkillSchema), skillController_1.createSkill);
router.put("/:id", auth_1.authMiddleware, (0, validate_1.validate)({ params: skillValidation_1.skillIdParamSchema, body: skillValidation_1.updateSkillSchema }), skillController_1.updateSkill);
router.delete("/:id", auth_1.authMiddleware, (0, validate_1.validate)({ params: skillValidation_1.skillIdParamSchema }), skillController_1.deleteSkill);
router.get("/me", auth_1.authMiddleware, skillController_1.getMySkills);
router.get("/user/:userId", (0, validate_1.validate)({ params: skillValidation_1.skillUserIdParamSchema }), skillController_1.getSkillsByUserId);
exports.default = router;
