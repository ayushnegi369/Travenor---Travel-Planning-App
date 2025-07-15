import mongoose from "mongoose";

// to handle google signin/signup
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        // console.log(conn);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error(
                "An unknown error occurred during MongoDB connection."
            );
        }
        process.exit(1);
    }
};

// to handle google login users
export const connectGoogleDB = async () => {
    try {
        const conn = mongoose.createConnection(
            process.env.MONGO_URI_GOOGLE as string
        );
        conn.on("connected", () => {
            console.log(`MongoDB Connected: ${conn.host}`);
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error(
                "An unknown error occurred during MongoDB connection."
            );
        }
        process.exit(1);
    }
};
