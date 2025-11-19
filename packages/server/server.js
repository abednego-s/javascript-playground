const express = require("express");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const { Sandbox } = require("@e2b/code-interpreter");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, "static")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "static", "index.html"));
});

const clients = new Map();

wss.on("connection", async (ws) => {
  const sandbox = await Sandbox.create();
  const channelName = sandbox.getHost();
  if (clients.has(channelName)) {
    clients.set(channelName, [...clients.get(channelName), ws]);
  } else {
    clients.set(channelName, [ws]);
  }

  function sendToClient(data) {
    clients.get(channelName).forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  ws.on("message", async (rawData) => {
    const isSandboxRunning = await sandbox.isRunning();

    if (!isSandboxRunning) {
      ws.close(1000, "Sandbox is not running, disconnect websocket.");
      return;
    }

    const FILE_PATH = "/home/user/app/index.js";

    console.log(`[HITTING API]`);

    try {
      await sandbox.files.write(FILE_PATH, `${rawData}`);
    } catch (error) {
      console.error("Unable to write file", error);
    }

    try {
      await sandbox.commands.run(`node ${FILE_PATH}`, {
        background: true,
        onStdout: (data) => {
          const response = { type: "log", message: `${data}` };
          sendToClient(response);
        },
        onStderr: (error) => {
          const response = { type: "error", message: `${error}` };
          sendToClient(response);
        },
      });
    } catch (error) {
      console.error("Error executing node", error);
    }
  });

  ws.on("close", () => {
    clients.delete(channelName);
    sandbox.kill();
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
