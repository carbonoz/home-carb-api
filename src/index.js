import cors from 'cors'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import socketIO from 'socket.io'
import socketIOClient from 'socket.io-client'
import client from './config/mqtt'
import { connectDatabase, disconnectDatabase, prisma } from './config/db'
import { findMeanOfPowerTopicsNew } from './utils/data'

const app = express()

const server1Url = 'http://localhost:9000'

app.use(cors())
app.use(morgan('dev'))

const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:7000',
  },
})

io.on('connection', async (socket) => {
  console.log('A user connected yes')
  const topics = await prisma.topic.findMany()
  client.on('message', (topic, message) => {
    console.log('Data sent to redis')
    topics.forEach((t) => {
      let data = {
        topic,
        message: message.toString(),
        userId: t.userId,
        date: new Date(),
      }
      findMeanOfPowerTopicsNew(data)
        .then((result) => {
          const { date: Date, userId, pv, load } = result
          io.emit('mqttMessage', {
            pv,
            load,
            userId,
            date: Date,
          })
        })
        .catch((error) => {
          console.error(`Error saving mean values for :`, error)
        })
    })
  })
  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

//client

const socket = socketIOClient(server1Url)

//mqtt server

client.on('connect', () => {
  console.log('Connected to MQTT broker.')
})

client.on('error', (error) => {
  console.error('MQTT client error:', error)
})

socket.on('connect', () => {
  console.log('Connected to the API  Server.')
  socket.on('topics', async (topics) => {
    topics?.forEach((t) =>
      client.subscribeAsync(t?.topicName, (err) => {
        if (err) {
          console.error('Error subscribing to this topic:', err)
        }
      })
    )
  })
})

const PORT = process.env.PORT || 8000

const startServer = async () => {
  await connectDatabase()
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

startServer().catch(console.error)

process.on('SIGINT', async () => {
  await disconnectDatabase()
  process.exit(0)
})
