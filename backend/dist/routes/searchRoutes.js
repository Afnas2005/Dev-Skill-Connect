"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const searchController_1 = require("../controllers/searchController");
const validate_1 = require("../middleware/validate");
const searchValidation_1 = require("../validations/searchValidation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", auth_1.authMiddleware, (0, validate_1.validate)({ query: searchValidation_1.searchQuerySchema }), searchController_1.searchSkills);
router.post("/connect/:userId", auth_1.authMiddleware, searchController_1.connectWithUser);
router.patch("/connect/:userId", auth_1.authMiddleware, (0, validate_1.validate)({ body: searchValidation_1.connectActionBodySchema }), searchController_1.respondToConnectionRequest);
exports.default = router;
