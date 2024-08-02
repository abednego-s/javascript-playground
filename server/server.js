const express = require("express")
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const transformScript = require("./transform-script");
const app = express()
const wss = new WebSocket.Server({ port: 8081 });
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())

const clients = []

wss.on("connection", (ws) => {
  // console.log("New client connected");
  clients.push(ws)

  ws.on("message", (data) => {
    // console.log(`Received: ${message}`);
    try {
      const { type, message } = JSON.parse(data)
      console.log("🚀 ~ ws.on ~ type:", type)

      if (type === "script") {
        const result = transformScript(`${message}`)
        clients.forEach((client) => {
          if (client === ws && client.readyState === WebSocket.OPEN) {
            const response = { type: "script", message: result }
            client.send(JSON.stringify(response))
          }
        })
      } else if (type === "page") {
        clients.forEach((client) => {
          if (client != ws && client.readyState === WebSocket.OPEN) {
            const response = { type: "page", message }
            client.send(JSON.stringify(response))
          }
        })
      }
    } catch (error) {
      const response = { type: "error", message: `Error ${error}` }
      ws.send(JSON.stringify(response));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})