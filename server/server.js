const express = require("express")
const WebSocket = require("ws");
const bodyParser = require("body-parser")
const app = express()
const wss = new WebSocket.Server({ port: 8081 });
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(express.static("dist"))

app.post("/exec", (req, res) => {
  res.send({ results: ["hello"] })
})

const clients = []

wss.on("connection", (ws) => {
  console.log("New client connected");

  clients.push(ws)

  ws.on("message", (message) => {
    // console.log(`Received: ${message}`);

    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`${message}`)
      }
    })

    // ws.send(`Server received: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})