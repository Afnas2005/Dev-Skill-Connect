import express from "express";
import {
    connectWithUser,
    respondToConnectionRequest,
    searchSkills,
} from "../controllers/searchController";
import { validate } from "../middleware/validate";
import {
    connectActionBodySchema,
    searchQuerySchema,
} from "../validations/searchValidation";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, validate({ query: searchQuerySchema }), searchSkills);
router.post("/connect/:userId", authMiddleware, connectWithUser);
router.patch(
    "/connect/:userId",
    authMiddleware,
    validate({ body: connectActionBodySchema }),
    respondToConnectionRequest
);

export default router;
