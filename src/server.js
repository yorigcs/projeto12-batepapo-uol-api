import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import isValid from './validations.js';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URL);
let mongoDB = null;
mongoClient.connect()
    .then(() => mongoDB = mongoClient.db(process.env.MONGO_DB))
    .catch(err => console.log(err));

const server = express();
server.use([cors(), express.json()]);

server.post('/participants', async (req, res) => {
    const { name } = req.body;
    try {
        //is name valid?
        const isNameValid = await isValid({ username: name });
        if (!isNameValid) {
            res.sendStatus(422)
            return;
        }
        //register new participant if not already registered
        const participants = mongoDB.collection("participants");
        const isParticipant = await participants.findOne({ name });
        if (isParticipant) {
            console.log('O nome já existe!')
            res.sendStatus(409)
            return;
        }
        await participants.insertOne({ name, lastStatus: Date.now() });

        //register new message type status from new participant
        const messages = mongoDB.collection("messages");
        const messageStatus = { from: name, to: 'Todos', text: 'Entra na sala...', type: 'status', time: dayjs().format('HH:MM:ss') }
        await messages.insertOne(messageStatus);
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.get('/participants', async (req, res) => {
    try {
        const participants = mongoDB.collection("participants");
        const listParticipants = await participants.find({}).toArray();
        res.send(listParticipants);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})

server.post('/messages', async (req, res) => {
    const { to, text, type } = req.body;
    const from = req.header('User');
    try {
        const isValidMessage = await isValid({ to, text, type });

        const participants = mongoDB.collection("participants");
        const isParticipant = await participants.findOne({ name: from });

        if (!isValidMessage || !isParticipant) {
            res.sendStatus(422);
            return;
        }

        const messages = mongoDB.collection("messages");
        await messages.insertOne({ from, to, text, type, time: dayjs().format('HH:MM:ss') })
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.get('/messages', async (req, res) => {
    const limit = Number(req.query.limit);
    const from = req.header('User');
    if (!from) {
        res.sendStatus(422);
        return;
    }
    try {
        const messages = mongoDB.collection("messages");
        const showMessages = limit ? await messages.find({ $or: [{ from }, { to: from }, { to: 'Todos' }] }).sort({$natural: -1}).limit(limit).toArray()
                            : await messages.find({ $or: [{ from }, { to: from }, { to: 'Todos' }] }).sort({$natural: -1}).toArray();
        res.send(showMessages.reverse());
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }

});

server.post('/status', async (req, res) => {
    const name = req.header('User');
    if (!name) {
        res.sendStatus(422);
        return;
    }
    try {
        const participants = mongoDB.collection("participants");
        const isParticipant = await participants.findOne({ name });
        if (!isParticipant) {
            res.sendStatus(404);
            return;
        }

        await participants.updateOne({ name }, { $set: { lastStatus: Date.now() } });
        res.sendStatus(200);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);

    }

});

server.listen(process.env.PORT, () => console.log('listening on port ' + process.env.PORT));

