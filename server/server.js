const express = require("express")
const WebSocket = require("ws")
const bodyParser = require("body-parser")
const path = require("path")
const http = require("http")
const runScript = require("./utils/run-script")
const { createChannelName } = require("./utils/channels")
require("dotenv").config();
require("global-jsdom/register")

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "..", "public", "web")))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "web", "index.html"))
})

let wsServer = null
const clients = new Map()

process.on("uncaughtException", (error) => {
  const response = { type: "error", message: error.message }
  if (wsServer) {
    wsServer.send(JSON.stringify(response));
  }
});

process.on("unhandledRejection", (reason) => {
  const response = { type: "error", message: reason.message }
  if (wsServer) {
    wsServer.send(JSON.stringify(response));
  }
});

wss.on("connection", (ws) => {
  const channelName = createChannelName()
  if (clients.has(channelName)) {
    clients.set(channelName, [...clients.get(channelName), ws])
  } else {
    clients.set(channelName, [ws])
  }

  wsServer = ws

  ws.on("message", (data) => {
    try {
      runScript(`${data}`, (logs) => {
        clients.get(channelName).forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const response = { type: "logs", message: logs }
            client.send(JSON.stringify(response))
          }
        })
      })
    } catch (error) {
      const response = { type: "error", message: `${error}` }
      ws.send(JSON.stringify(response));
    }
  });

  ws.on("close", () => {
    clients.delete(channelName)
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
})