# Brachistochrone Curve Demonstration Dashboard

React + TypeScript + TailwindCSS dashboard for a real-time IoT brachistochrone experiment.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

## MQTT Topic

- `brachistochrone/time`
- Payload example:

```json
{
  "lane": 1,
  "time": 1.243
}
```
