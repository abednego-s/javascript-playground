import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { debounce } from "./utils/debounce";
import { ResizablePanel } from "./utils/resizable-panel";
import "./style.css";
import "./xterm.css";

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
const terminal = createTerminal();

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
    if (parsed.message.replace(/(\r\n|\n|\r)/gm, "")) {
      terminal.write(`${parsed.message}`);
    }
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
    cursorBlink: true,
    convertEol: true,
  });
  const fitAddon = new FitAddon();
  term.open(outputElem);
  term.loadAddon(fitAddon);
  fitAddon.fit();
  return term;
}

const sendToWsServer = debounce((code) => {
  ws.send(code);
}, 1000);

function runCode(code: string) {
  sendToWsServer(code);
}

terminal.writeln("Hello, World!");
