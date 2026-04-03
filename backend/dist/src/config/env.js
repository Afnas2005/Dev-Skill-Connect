"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const dotenvPaths = [
    path_1.default.resolve(process.cwd(), ".env"),
    path_1.default.resolve(__dirname, "../../.env"),
    path_1.default.resolve(__dirname, "../.env"),
];
let loaded = false;
const loadEnv = () => {
    if (loaded) {
        return;
    }
    for (const dotenvPath of dotenvPaths) {
        const result = dotenv_1.default.config({ path: dotenvPath });
        if (!result.error) {
            loaded = true;
            return;
        }
    }
    dotenv_1.default.config();
    loaded = true;
};
exports.loadEnv = loadEnv;
(0, exports.loadEnv)();
