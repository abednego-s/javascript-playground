import "./style.css";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { debounce } from "./utils/debounce";
import { ResizablePanel } from "./utils/resizable-panel";

const isProduction = import.meta.env.MODE === "production";
const wsUrl = isProduction
  ? `wss://${import.meta.env.VITE_WS_SERVER}`
  : `ws://${import.meta.env.VITE_WS_SERVER}:${
      import.meta.env.VITE_WS_SERVER_PORT
    }`;
const codeEditor = document.getElementById("code-editor")!;
const output = document.getElementById("output")!;

const ws = connectToWs();
createCodeEditor();
createResizable();

function createCodeEditor() {
  return new EditorView({
    doc: "console.log('Hello, World!');",
    parent: codeEditor,
    extensions: [
      basicSetup,
      javascript(),
      okaidia,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const value = update.state.doc.toString();
          runCode(value);
        }
      }),
    ],
  });
}

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

function createResizable() {
  return new ResizablePanel("resizableContainer");
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
