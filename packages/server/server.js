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

const APP_PATH = "/home/user/app";
const SCRIPT_PATH = `${APP_PATH}/index.js`;
const MANIFEST_PATH = `${APP_PATH}/package.json`;

function sendToClient(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

wss.on("connection", async (ws) => {
  const sandbox = await Sandbox.create();
  const runningSandboxCommands = [];

  ws.on("message", async (rawData) => {
    const code = String(rawData);
    const isSandboxRunning = await sandbox.isRunning();

    if (!isSandboxRunning) {
      ws.close(1000, "Sandbox is not running, disconnect websocket.");
      return;
    }

    if (runningSandboxCommands.length > 0) {
      runningSandboxCommands.forEach((cmd) => {
        cmd.kill();
      });
      runningSandboxCommands.length = 0;
    }

    if (!code) {
      return;
    }

    try {
      await sandbox.files.write([
        { path: SCRIPT_PATH, data: code },
        { path: MANIFEST_PATH, data: JSON.stringify({ type: "module" }) },
      ]);
    } catch (error) {
      console.error("Unable to write file", error);
    }

    try {
      const command = await sandbox.commands.run(`node ${SCRIPT_PATH}`, {
        background: true,
        onStdout: (data) => {
          const response = { type: "log", message: `${data}` };
          sendToClient(ws, response);
        },
        onStderr: (error) => {
          const response = { type: "error", message: `${error}` };
          sendToClient(ws, response);
        },
      });
      runningSandboxCommands.push(command);
    } catch (error) {
      console.error("Error executing node", error);
    }
  });

  ws.on("close", () => {
    sandbox.kill();
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
