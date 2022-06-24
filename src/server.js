import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import validations from './validations.js';
import { MongoConnect, MongoClose } from './MongoDB.js';
import dotenv from 'dotenv';
dotenv.config();


const server = express();
server.use([cors(), express.json()]);

server.post('/participants', async (req, res) => {
    const { name } = req.body;
    try {
        //is name valid?
        await validations({ username: name });

        const connect = await MongoConnect();
        //register new participant if not already registered
        const participants = connect.collection(process.env.MONGO_COLLECTION_PARTICIPANTS);
        const isParticipant = await participants.findOne({ name });
        if (isParticipant) {
            console.log('O nome já existe!')
            res.sendStatus(409)
            return;
        }
        await participants.insertOne({ name, lastStatus: Date.now() });

        //register new message type status from new participant
        const messages = connect.collection(process.env.MONGO_COLLECTION_MESSAGES);
        const messageStatus = { from: name, to: 'Todos', text: 'Entra na sala...', type: 'status', time: dayjs().format('HH:MM:ss') }
        await messages.insertOne(messageStatus);

        res.sendStatus(201);

    } catch (err) {
        console.log(err)
        res.sendStatus(400);
    } finally {
        await MongoClose();
    }

});

server.get('/participants', async (req, res) => {
    try {
        const connect = await MongoConnect();
        const participants = connect.collection(process.env.MONGO_COLLECTION_PARTICIPANTS);
        const listParticipants = await participants.find({}).toArray();
        res.send(listParticipants);
    } catch (err) {
        console.log(err)
        res.sendStatus(400);
    }
})

server.listen(process.env.PORT, () => console.log('listening on port ' + process.env.PORT));

