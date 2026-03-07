import mqtt, { MqttClient } from 'mqtt';

export const MQTT_TOPIC_RESULT = 'brachistochrone/result';
export const MQTT_TOPIC_START  = 'brachistochrone/start';
export const MQTT_TOPIC_RESET  = 'brachistochrone/reset';
export const MQTT_TOPIC_MODE   = 'brachistochrone/mode';

const brokerUrl =
  import.meta.env.VITE_MQTT_BROKER_URL ??
  'wss://b9690b40bb454fe394b7670e6def925d.s1.eu.hivemq.cloud:8884/mqtt';

const username = import.meta.env.VITE_MQTT_USERNAME ?? 'brachistochrone';
const password = import.meta.env.VITE_MQTT_PASSWORD ?? 'Pj123456';

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
