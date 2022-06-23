import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import validations from './validations.js';
import Mongo from './MongoDB.js';
import dotenv from 'dotenv';
dotenv.config();


const server = express();
server.use([cors(), express.json()]);

server.post('/participants', async (req, res) => {
    const { name } = req.body;
    try {
        await validations({username: name});

        const participant = { name, lastStatus: Date.now()};
        await Mongo(process.env.MONGO_DB_NAME,process.env.MONGO_COLLECTION_PARTICIPANTS,participant,1);

        const userLobby = {from: name, to: 'Todos', text: 'Entra na sala...', type: 'status', time: dayjs().format('HH:MM:ss')}
        await Mongo(process.env.MONGO_DB_NAME,process.env.MONGO_COLLECTION_MESSAGES,userLobby,2)
        
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(err);
    }
    
   


});

server.listen(process.env.PORT, () => console.log('listening on port ' + process.env.PORT));

