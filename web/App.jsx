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

function App() {
  const [ws, setWs] = useState(null);
  const [output, setOutput] = useState(null);

  useEffect(() => {
    const isProduction = process.env.REACT_APP_ENV === "production";
    console.log("🚀 ~ useEffect ~ isProduction:", isProduction);
    const wsServer =
      process.env.REACT_APP_WS_SERVER +
      ":" +
      process.env.REACT_APP_WS_SERVER_PORT +
      "/";
    let wsUrl = isProduction ? `wss://${wsServer}` : `ws://${wsServer}`;
    console.log("🚀 ~ useEffect ~ wsUrl:", wsUrl);

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = function () {
      setWs(websocket);
    };
    websocket.onmessage = function (e) {
      const parsed = JSON.parse(e.data);
      setOutput(parsed);
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
      <header className="bg-teal-500 text-white px-4 py-6">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            JS Playground — Write & run Javascript Code Online
            <sup className="font-normal italic">(Beta)</sup>
          </h1>
          <ul>
            <a
              href="https://github.com/abednego-s/javascript-playground"
              className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center"
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
