import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL);

const Mongo = async (mongoDB, MongoCollection, object, type = 0) => {

    try {
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(mongoDB);
        const collection = db.collection(MongoCollection);
        
        switch (type) {
            case 1:
                const findUser = await collection.findOne({ name: object.name });
                if (findUser) throw 409;

                const insertUser = await collection.insertOne(object);
                console.log('Inserted documents =>', insertUser);

                break;
            case 2: 
                const insertUserLobby = await collection.insertOne(object);
                console.log('Inserted documents =>', insertUserLobby);
                break;
            default:
                break
        }

    } catch (err) {
        throw err;
    } finally {
        await client.close();
        console.log('Connection closed successfully!');
    }

};


export default Mongo;