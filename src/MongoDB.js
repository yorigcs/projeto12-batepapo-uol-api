import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL);

const MongoConnect = async () => {

    try {
        await client.connect();
        //console.log('Connected successfully to server');
        return client.db(process.env.MONGO_DB_NAME);
    } catch (err) {
        throw err;
    }

};

const MongoClose = async () => {
    try {
        await client.close();
        //console.log('Connection closed successfully!');
    } catch (err) {
        throw err;
    }
};


export { MongoConnect, MongoClose };