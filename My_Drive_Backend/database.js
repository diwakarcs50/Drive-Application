import { MongoClient} from "mongodb";

const uri = "mongodb://127.0.0.1:27017/storageApp";
const client = new MongoClient(uri);


export async function connectDb() {
    await client.connect()
    const db = client.db()
    console.log("Database Connected")
    return db;

}

process.on('SIGINT', async() => {
    await client.close()
    console.log("Database Disconnected")
    process.exit(0)
})