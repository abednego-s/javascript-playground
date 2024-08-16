const express = require("express")
const WebSocket = require("ws")
const bodyParser = require("body-parser")
const path = require("path")
const runScript = require("./utils/run-script")
require("global-jsdom/register")

const app = express()
const wss = new WebSocket.Server({ port: 8081 })
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "..", "public", "web")))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "web", "index.html"))
})

let wsServer = null
const clients = []

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
  clients.push(ws)
  wsServer = ws

  ws.on("message", (data) => {
    try {
      runScript(`${data}`, (logs) => {
        clients.forEach((client) => {
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
    console.log("Client disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})