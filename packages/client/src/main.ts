import "./style.css";
import { debounce } from "./utils/debounce";

const isProduction = import.meta.env.MODE === "production";
const wsUrl = isProduction
  ? `wss://${import.meta.env.VITE_WS_SERVER}`
  : `ws://${import.meta.env.VITE_WS_SERVER}:${
      import.meta.env.VITE_WS_SERVER_PORT
    }`;
const ws = connectToWs();
const codeEditor = document.getElementById("code-editor");
const output = document.getElementById("output") as HTMLDivElement;

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
    console.log("[PARSED]: ", parsed);
    output.innerHTML += parsed.message;
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

const debounced = debounce((e) => {
  console.log("[HITTING API: ]", e);
  ws.send(e);
}, 500);

function runCode(e: string) {
  try {
    new Function(e)();
  } catch (error) {
    output.innerHTML = `${error}`;
    return false;
  }

  output.innerHTML = "";
  debounced(e);
}

codeEditor?.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  runCode(target.value);
});
