import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const dbName = "next14-mongodb-rest-apis";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

let cachedClient: mongoose.Mongoose | null = null;

const connect = async () => {
  if (cachedClient) {
    console.log("Already connected");
    return cachedClient;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName
    });

    cachedClient = mongoose;
    console.log("Connected to database");

    return cachedClient;
  } catch (error: any) {
    console.error("Error: ", error);
    throw new Error(`Error connecting to database: ${error.message}`);
  }
};

export default connect;
