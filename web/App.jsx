import { useEffect, useRef, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { Code2, Github } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OutputPanel } from "@/components/output-panel";
import { useToast } from "@/components/ui/use-toast";

function App() {
  const [ws, setWs] = useState(null);
  const [output, setOutput] = useState(null);
  const [isRendered, setRendered] = useState(false);
  const retryIntervalRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const isProduction = process.env.REACT_APP_ENV === "production"; // NODE_ENV ??
    let wsUrl = isProduction
      ? `wss://${process.env.REACT_APP_WS_SERVER}`
      : `ws://${process.env.REACT_APP_WS_SERVER}:${process.env.REACT_APP_WS_SERVER_PORT}`;

    function connectToWs() {
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = function () {
        setWs(websocket);
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      };

      websocket.onmessage = function (e) {
        const parsed = JSON.parse(e.data);
        setOutput(parsed);
      };

      websocket.onclose = function () {
        retryConnection();
        showConnectionError();
      };
    }

    function retryConnection() {
      if (!retryIntervalRef.current) {
        retryIntervalRef.current = setInterval(connectToWs, 5000);
      }
    }

    function showConnectionError() {
      toast({
        variant: "destructive",
        title: "Service has stopped",
        description:
          "Unable to run your code because the service is unavailable.",
      });
    }

    connectToWs();

    return () => {
      ws?.close();
      clearInterval(retryIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRendered) {
      return;
    }

    if (ws) {
      sendScriptToWsServer(sampleScript);
      setRendered(true);
    }
  }, [ws]);

  function sendScriptToWsServer(code) {
    setOutput(null);
    ws.send(code);
  }

  return (
    <>
      <header className="p-2">
        <nav className="flex items-center justify-between">
          <h1 className="flex text-2xl">
            <span className="flex items-center font-bold text-red-500">
              <Code2 />
              <span className="ml-2">Javascript Playground</span>
            </span>
            <span className="ml-2 text-slate-500">
              — Write & run Javascript Code
            </span>
          </h1>
          <ul>
            <a
              href="https://github.com/abednego-s/javascript-playground"
              className="flex items-center justify-center w-12 h-12 border-2 border-black rounded-full"
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
          <OutputPanel output={output} />
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
const hello = "hello"
const world = " world"

console.log(hello + world)
`;

export default App;
