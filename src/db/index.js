import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"


const connectDB = async () =>{
    try {
        const connenctionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MongoDB connected  !! DB Connected ${connenctionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection failed",error);
        process.exit(1);
    }
}


export default connectDB;