import "./style.css";
import { debounce } from "./utils/debounce";

const isProduction = import.meta.env.MODE === "production";
const wsUrl = isProduction
  ? `wss://${import.meta.env.VITE_WS_SERVER}`
  : `ws://${import.meta.env.VITE_WS_SERVER}:${
      import.meta.env.VITE_WS_SERVER_PORT
    }`;

function connectToWs() {
  const websocket = new WebSocket(wsUrl);

  websocket.onopen = function () {
    console.log("connected to ws: ", wsUrl);
    // setWs(websocket);
    // setConnectedToWs(true);
    // clearInterval(retryIntervalRef.current);
    // retryIntervalRef.current = null;
  };

  websocket.onmessage = function (e) {
    const parsed = JSON.parse(e.data);
    console.log(parsed);
    // setOutput(parsed);
  };

  websocket.onclose = function () {
    console.log("Connection closed!");
    // setConnectedToWs(false);
    //   retryConnection();
  };

  return websocket;
}

// function retryConnection() {
//   setInterval(connectToWs, 5000)
// }

const ws = connectToWs();

const codeEditor = document.getElementById("code-editor");

const debounced = debounce((e) => {
  console.log(e);
  ws.send(e);
}, 500);

codeEditor?.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  debounced(target.value);
});
