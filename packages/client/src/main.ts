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
const codeEditorElem = document.getElementById("code-editor")!;
const outputElem = document.getElementById("output")!;
const ws = connectToWs();
createCodeEditor();
createResizable();

function createCodeEditor() {
  return new EditorView({
    doc: "console.log('Hello, World!');",
    parent: codeEditorElem,
    extensions: [
      basicSetup,
      javascript(),
      okaidia,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const value = update.state.doc.toString();
          output.clear();
          runCode(value);
        }
      }),
    ],
  });
}

function connectToWs() {
  const websocket = new WebSocket(wsUrl);

  websocket.onopen = function () {
    console.log("[websocket]: ", wsUrl);
    // setWs(websocket);
    // setConnectedToWs(true);
    // clearInterval(retryIntervalRef.current);
    // retryIntervalRef.current = null;
  };

  websocket.onmessage = function (e) {
    const parsed = JSON.parse(e.data) as {
      type: "log" | "error";
      message: string;
    };
    console.log("[PARSED]: ", parsed);
    output.write(parsed);
    // proxiedLogs.push(parsed);
  };

  websocket.onclose = function () {
    console.log("Connection closed!");
    // setConnectedToWs(false);
    // retryConnection();
  };

  return websocket;
}

function createResizable() {
  return new ResizablePanel("resizableContainer");
}

// function retryConnection() {
//   setInterval(connectToWs, 5000)
// }

const sendToWsServer = debounce((code) => {
  if (!code) return;
  ws.send(code);
}, 1000);

function runCode(code: string) {
  try {
    new Function(code)();
  } catch (error) {
    output.write({ type: "error", message: `${error}` });
    return false;
  }
  sendToWsServer(code);
}
const output = {
  write(output: { type: "log" | "error"; message: string }) {
    if (output.type === "error") {
      const ul = document.createElement("ul");
      const li = document.createElement("li");
      li.classList.add(output.type);
      li.innerText = output.message;
      ul.appendChild(li);
      outputElem.appendChild(ul);
      return;
    }

    const ul =
      outputElem.children.length === 0
        ? document.createElement("ul")
        : outputElem.getElementsByTagName("ul")[0];
    const li = document.createElement("li");
    li.classList.add(output.type);
    li.innerText = output.message;
    ul.appendChild(li);
    outputElem.appendChild(ul);
  },
  clear() {
    outputElem.replaceChildren();
  },
};
