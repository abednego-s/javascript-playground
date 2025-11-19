import "./style.css";
import "./xterm.css";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { Terminal } from "@xterm/xterm";
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
const term = createTerminal();
term.write("Hello, World!");

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
          runCode(value);
        }
      }),
    ],
  });
}

function connectToWs() {
  const websocket = new WebSocket(wsUrl);

  websocket.onopen = function () {
    console.log("[websocket] connected.");
  };

  websocket.onmessage = function (e) {
    const parsed = JSON.parse(e.data) as {
      type: "log" | "error";
      message: string;
    };
    console.log("[PARSED]: ", parsed);
    term.writeln(`${parsed.message}`);
  };

  websocket.onclose = function () {
    console.log("Connection closed!");
  };

  return websocket;
}

function createResizable() {
  return new ResizablePanel("resizableContainer");
}

function createTerminal() {
  const term = new Terminal({
    convertEol: true,
  });
  term.open(outputElem);
  return term;
}

const sendToWsServer = debounce((code) => {
  if (!code) return;
  try {
    new Function(code)();
  } catch (error) {
    term.writeln(`${error}`);
    // output.write({ type: "error", message: `${error}` });
    return false;
  }
  ws.send(code);
}, 1000);

function runCode(code: string) {
  sendToWsServer(code);
}
