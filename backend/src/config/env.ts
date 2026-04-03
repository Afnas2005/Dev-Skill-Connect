import dotenv from "dotenv";
import path from "path";

const dotenvPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../.env"),
];

let loaded = false;

export const loadEnv = () => {
    if (loaded) {
        return;
    }

    for (const dotenvPath of dotenvPaths) {
        const result = dotenv.config({ path: dotenvPath });
        if (!result.error) {
            loaded = true;
            return;
        }
    }

    dotenv.config();
    loaded = true;
};

loadEnv();
