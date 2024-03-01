import cors from 'cors';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import socketIO from 'socket.io';
import socketIOClient from 'socket.io-client';
import client from './config/mqtt';
import router from "./routes/index";

const app = express();



const server1Url = 'http://localhost:9000'


app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/api/v1/', router)


const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:7000',
  }
});



io.on('connection', (socket) => {
  console.log('A user connected');
  client.on("message", (topic, message) => {
    console.log('Data sent to redis')
    io.emit('mqttMessage', { topic, message: message.toString() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


//client


const socket = socketIOClient(server1Url)

//mqtt server

client.on("connect", () => {
  console.log('Connected to MQTT broker.');
});

client.on("error", (error) => {
  console.error('MQTT client error:', error);
});

socket.on('connect', () => {
  console.log('Connected to the API  Server.')
  socket.on('topics', (topics) => {
    console.log('Subscribing to topic:', topics.topicName);
    client.subscribe(topics?.topicName, (err) => {
      if (err) {
        console.error('Error subscribing to this topic:', err);
      }
    });
  });
});



const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});