# Brachistochrone Curve Demonstration Dashboard

React + TypeScript + TailwindCSS dashboard for a real-time IoT brachistochrone experiment.  
Compares the speed of a ball rolling down 3 different tracks via ESP32 + MQTT.

## Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Real-time experiment results across 10 rounds, lane ranking, chart, and trial history |
| **Game Page** | Prediction game — guess the fastest lane before the race starts, earn points |
| **Feedback Page** | Aggregated pre/post understanding feedback graph from all players |

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```env
VITE_MQTT_BROKER_URL=wss://your-broker:8884/mqtt
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
VITE_SIMPLE_MQTT_LISTENER=false   # set true to show raw MQTT debug view only
```

## Lane Configuration

| Lane | Track Type |
|------|-----------|
| Lane 1 | Steep |
| Lane 2 | Cycloid |
| Lane 3 | Straight Line |

## MQTT Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `brachistochrone/time` | ESP32 → Web | Lane time result per message |
| `brachistochrone/winner` | ESP32 → Web | Winning lane number |
| `brachistochrone/mode` | Web → ESP32 | Set mode: `MANUAL` or `AUTO` |
| `brachistochrone/start` | Web → ESP32 | Trigger race start (AUTO mode only) |
| `brachistochrone/reset` | Web → ESP32 | Reset the race |

### Payload Examples

**`brachistochrone/time`** (published 3 times per race, once per lane)
```json
{ "lane": 1, "time": 1.243 }
```

**`brachistochrone/winner`**
```
1
```

**`brachistochrone/mode`**
```
AUTO
```

## Tech Stack

- React + TypeScript
- TailwindCSS
- Recharts
- MQTT.js (WebSocket over TLS)
- HiveMQ Cloud Broker
