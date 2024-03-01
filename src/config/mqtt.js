const mqtt = require("mqtt");



const client = mqtt.connect("mqtt://192.168.160.55", {
  clientId: "mqttx_56713125",
  username: "Chris",
  password: "jx44xGTpXZvDazJ9UqAJ",
  port: "1883"
});


export default client