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
    const websocket = new WebSocket("ws://localhost:8081/");

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
      sendScriptToWsServer(defaultScript);
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
            value={defaultScript}
            onChange={sendScriptToWsServer}
            extensions={[javascript()]}
            height="600px"
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

const defaultScript = `
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
