import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI as string;

        await mongoose.connect(uri, {
            dbName: "devskill-connect",
        });

        console.log("[DB]  Connected to MongoDB Atlas");
    } catch (error: any) {
        console.error("[DB]  Connection error:", error.message);
        process.exit(1);
    }
};