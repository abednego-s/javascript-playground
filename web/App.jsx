import { useEffect, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Github } from "lucide-react";
import { Output } from "@/components/output";
import { DisconnectedAlert } from "@/components/disconnected-alert";

function App() {
  const [ws, setWs] = useState(null);
  const [output, setOutput] = useState(null);
  const [isConnected, setConnected] = useState(true);

  useEffect(() => {
    const isProduction = process.env.REACT_APP_ENV === "production";
    let wsUrl = isProduction
      ? `wss://${process.env.REACT_APP_WS_SERVER}`
      : `ws://${process.env.REACT_APP_WS_SERVER}:${process.env.REACT_APP_WS_SERVER_PORT}`;

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = function () {
      setWs(websocket);
    };

    websocket.onmessage = function (e) {
      const parsed = JSON.parse(e.data);
      setOutput(parsed);
    };

    websocket.onclose = function (e) {
      setConnected(false);
    };

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    if (ws) {
      sendScriptToWsServer(sampleScript);
    }
  }, [ws]);

  function sendScriptToWsServer(code) {
    setOutput(null);
    ws.send(code);
  }

  return (
    <>
      <header className="px-4 py-6">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl">
            <span className="text-red-500 font-bold">JS Playground</span>
            <span className="text-slate-500">
              {" "}
              — Write & run Javascript Code
            </span>
          </h1>
          <ul>
            <a
              href="https://github.com/abednego-s/javascript-playground"
              className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center"
            >
              <Github size={28} />
            </a>
          </ul>
        </nav>
      </header>

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <CodeMirror
            value={sampleScript}
            onChange={sendScriptToWsServer}
            extensions={[javascript()]}
            theme={okaidia}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <Output output={output} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {!isConnected ? <DisconnectedAlert /> : null}
    </>
  );
}

const sampleScript = `
/**
 * ===========================
 * Write your Javascript code here and 
 * see the output on the left panel.
 * ===========================
 */
const hello = "hello";
const world = "world";

console.log(hello + " " + world)
`;

export default App;
