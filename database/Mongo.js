import mongoose from "mongoose";
import { DB_URL } from "../configs/env.js";


const connectDB = async () => {
    try {
       await mongoose.connect(DB_URL);
       console.log("Database connected successfully");
    } catch (error) {
        console.log("Error connecting to database: ", error);
    }
}

export default connectDB;