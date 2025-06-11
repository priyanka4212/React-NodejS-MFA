import { connect } from "mongoose";
const dbConnect = async () => {
    try{
        const mongoDbConnection = await connect(process.env.MONGO_URI );
        console.log(`MongoDB connected: ${mongoDbConnection.connection.host}`);

    }catch (error) {
        console.error(` Database connection faile ${error}`);
        process.exit(1);


    }

};

export default dbConnect;

