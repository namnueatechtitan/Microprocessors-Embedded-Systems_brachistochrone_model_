import mqtt, { MqttClient } from 'mqtt';

export const MQTT_TOPIC = 'brachistochrone/time';

const brokerUrl =
  import.meta.env.VITE_MQTT_BROKER_URL ??
  'wss://YOUR_CLUSTER.s1.eu.hivemq.cloud:8884/mqtt';

const username = import.meta.env.VITE_MQTT_USERNAME ?? '';
const password = import.meta.env.VITE_MQTT_PASSWORD ?? '';

export function createMqttClient(): MqttClient {
  return mqtt.connect(brokerUrl, {
    username,
    password,
    reconnectPeriod: 2000,
    clean: true,
    connectTimeout: 5000,
    keepalive: 30,
    clientId: `brachio-dashboard-${Math.random().toString(16).slice(2, 10)}`,
  });
}
