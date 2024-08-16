import { useEffect, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

const defaultScript = `
/**
 * Binary search
 */
function binarySearch(arr, x) { 
  let start = 0
  let end = arr.length - 1; 

  while (start <= end) { 
    let mid = Math.floor((start + end) / 2); 

    if (arr[mid] === x) {
      return true
    } else if (arr[mid] < x)  {
      start = mid + 1; 
    } else {
      end = mid - 1; 
    }     
  } 
  return false; 
}


let arr = [2, 3, 4, 10, 40]; 
let x = 10; 

console.log(binarySearch(arr, x)); 
`;

function App() {
  const [ws, setWs] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8081/");

    websocket.onopen = function () {
      setWs(websocket);
    };
    websocket.onmessage = function (e) {
      const parsed = JSON.parse(e.data);
      setConsoleLogs(parsed);
    };

    return () => {
      websocket.close();
    };
  }, []);

  function sendScriptToWsServer(code) {
    setConsoleLogs(null);
    ws.send(code);
  }

  return (
    <>
      <header className="bg-teal-500 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">
          JS Playground — Write & run Javascript Code Online
          <sup className="font-normal italic">(Beta)</sup>
        </h1>
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
          <div className="bg-slate-200 h-screen">
            <div className="p-5">
              <span className="block text-lg font-bold mb-4">Output</span>
              {consoleLogs ? (
                <div
                  className={`${
                    consoleLogs?.type === "error"
                      ? "text-red-400"
                      : "text-slate-800"
                  }`}
                >
                  <ScrollArea className="h-[600px] pb-40">
                    {consoleLogs.message &&
                    Array.isArray(consoleLogs.message) ? (
                      <ul>
                        {consoleLogs.message.map((log, index) => (
                          <li key={index}>
                            <div>
                              {log.map((item, index) => (
                                <span key={index}>
                                  {typeof item === "object" ? (
                                    <pre>
                                      {JSON.stringify(item, null, "\t")}
                                    </pre>
                                  ) : (
                                    item
                                  )}
                                </span>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      consoleLogs.message
                    )}
                  </ScrollArea>
                </div>
              ) : null}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}

export default App;
