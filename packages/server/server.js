const express = require("express");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
// const runScript = require("./utils/run-script")
// const createChannelName = require("./utils/create-channel-name");
// const replacer = require("./utils/replacer");
require("dotenv").config();
// require("global-jsdom/register")
const { Sandbox } = require("@e2b/code-interpreter");

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

// process.on("uncaughtException", (error) => {
//   const response = { type: "error", message: error.message }
//   if (wsServer) {
//     wsServer.send(JSON.stringify(response));
//   }
// });

// process.on("unhandledRejection", (reason) => {
//   const response = { type: "error", message: reason.message }
//   if (wsServer) {
//     wsServer.send(JSON.stringify(response));
//   }
// });

function sendToClient(data) {
  clients.get(channelName).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", async (ws) => {
  const sandbox = await Sandbox.create();
  const channelName = sandbox.getHost();
  if (clients.has(channelName)) {
    clients.set(channelName, [...clients.get(channelName), ws]);
  } else {
    clients.set(channelName, [ws]);
  }

  ws.on("message", async (rawData) => {
    const isSandboxRunning = await sandbox.isRunning();

    if (!isSandboxRunning) {
      throw new Error("Sandbox is not running");
    }

    const FILE_PATH = "/home/user/app/index.js";

    try {
      await sandbox.files.write(FILE_PATH, `${rawData}`);
    } catch (error) {
      throw new Error("Unable to write to disk", error);
    }

    try {
      await sandbox.commands.run(FILE_PATH, {
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
      throw new Error("Error executing node", error);
    }

    // try {
    //   runScript(`${data}`, (logs) => {
    //     clients.get(channelName).forEach((client) => {
    //       if (client.readyState === WebSocket.OPEN) {
    //         const response = { type: "logs", message: replacer(logs) };
    //         client.send(JSON.stringify(response));
    //       }
    //     });
    //   });
    // } catch (error) {
    //   const response = { type: "error", message: `${error}` };
    //   ws.send(JSON.stringify(response));
    // }
  });

  ws.on("close", () => {
    clients.delete(channelName);
    sandbox.kill();
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
