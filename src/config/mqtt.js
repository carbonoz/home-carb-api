import mqtt from 'mqtt'
import { prisma } from './db'

function connectToMQTT(userPort) {
  const { port, mqttUsername, mqttPassword, mqttPort, userId } = userPort

  const client = mqtt.connect(`mqtt://${port}`, {
    username: mqttUsername,
    password: mqttPassword,
    port: mqttPort,
  })

  client.on('connect', () => {
    console.log(`User ${userId} connected to MQTT broker on port ${mqttPort}`)
    client.subscribe('solar_assistant_DEYE/#')
  })

  client.on('error', (error) => {
    console.error(`MQTT client error for user ${userId}:`, error)
  })

  return client
}

async function connectUsersToMQTT() {
  try {
    const usersWithPorts = await prisma.userPorts.findMany({
      include: {
        user: true,
      },
    })

    const mqttClients = usersWithPorts.map((userPort) => {
      const client = connectToMQTT(userPort)
      return { userId: userPort.userId, client }
    })

    return mqttClients
  } catch (error) {
    console.error('Error fetching users or connecting to MQTT:', error)
    return []
  }
}

export default connectUsersToMQTT
