import mongoose from "mongoose";

// function to connect the database
export const connectDB = async () => {
    try{

        // to just check that mongo is connected or not?
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected successfully");
        });
        await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`)
    }catch(error){
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}