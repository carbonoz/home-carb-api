# CARBONOZ socket connection broker

## socket connection broker: CARBONOZ broker

CARBONOZ Socket Connection Broker is a real-time data retrieval and processing service that acts as an intermediary between the Carbonoz Solar Autopilot system and your backend services. It efficiently captures real-time data from the Carbonoz Solar Autopilot, processes it, and then stores it in Redis for fast access and real-time analytics.

### Overview

Carbonoz Solar Autopilot is an intelligent dashboard designed for monitoring and controlling hybrid solar systems. It provides key features such as data logging, analytics, CO2 avoidance metrics, and powerful export capabilities. The system offers ease of use with simple setup templates, automation controls, and event triggers for a smarter solar management experience.

The Socket Connection Broker connects to the Carbonoz Solar Autopilot's MQTT (Message Queuing Telemetry Transport) service, receiving energy data in real time. This data is immediately processed and saved to a Redis server for high-performance data storage. The broker ensures that solar system data is always up-to-date, enabling immediate feedback for users and system optimization.

#### Key Features

1. Real-time Data Integration: The broker connects to the Carbonoz Solar Autopilot via Web socket , allowing real-time data exchange.
2. Redis Storage: Data is stored in Redis, providing fast retrieval and efficient real-time updates for analytics and monitoring
3. Environmental Impact Tracking: By integrating with the Carbonoz Solar Autopilot, this service helps track energy production and CO2 offset. Each kilowatt-hour (kWh) of solar energy produced contributes to the reduction of greenhouse gas emissions, which can be monitored and analyzed through the system.
4. Data Logging & Analytics: Store detailed data such as energy production, battery levels, grid input, and output, allowing for deep insights and automated system control.

##### Data Structure for Redis Storage from oustide connection

The broker receives MQTT messages in JSON format, which contain the following key fields:

1. `topic`: The MQTT topic under which the data is published.

2. `message`: The actual payload data received from the Carbonoz Solar Autopilot.

3. `userId`: The user identifier, which must correspond to a registered user in the Carbonoz API.

4. `mqttTopicPrefix`: The prefix used in the MQTT topic, providing additional context for categorization for instance `solar-assistant-deye#`

```json
{
  "topic": "",
  "message": "",
  "userId": "",
  "mqttTopicPrefix": ""
}
```
