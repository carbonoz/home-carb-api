import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import WebSocket from 'ws'
import { connectDatabase, disconnectDatabase } from './config/db'
import connectUsersToMQTT from './config/mqtt'
import {  saveToRedis } from './utils/redis'

const app = express()
let mqttClients = []

app.use(cors())
app.use(morgan('dev'))

app.get('/', async (req, res) => {
  res.status(200).json({ data:"Running ok" })
})


function setupMQTTClient(clients,wsServer) {
  clients.forEach(({ client, userId }) => {
    client.on('message', (topic, message) => {
      const Message = message.toString()
      saveToRedis({ topic, message: Message, userId,wsServer })
        .then(() => {})
        .catch((error) => {
          console.error(`Error saving message for user ${userId}:`, error)
        })
    })
    client.on('error', (error) => {
      console.error(`MQTT client error for user ${userId}:`, error)
    })
  })
}

const startServer = async () => {
  await connectDatabase()
  const PORT = process.env.PORT || 8000
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
  const wsServer = new WebSocket.Server({ server })
  wsServer.on('connection', (ws) => {
    console.log('WebSocket client connected')
    ws.on('close', () => console.log('WebSocket client disconnected'))
  })
  try {
    mqttClients = await connectUsersToMQTT()
    setupMQTTClient(mqttClients, wsServer);
  } catch (error) {
    console.error('Error starting server:', error)
  }

  
}

startServer().catch(console.error)

process.on('SIGINT', async () => {
  await disconnectDatabase()
  process.exit(0)
})
