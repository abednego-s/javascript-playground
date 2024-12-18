import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Header } from "@/components/header";
import { LoadingPlayground } from "@/components/loading-playground";

const Playground = lazy(() => import("./components/playground"));

function App() {
  const [ws, setWs] = useState(null);
  const [output, setOutput] = useState(null);
  const [wasInitialRequestSent, setInitialRequestSent] = useState(false);
  const [isConnectedToWs, setConnectedToWs] = useState(false);
  const retryIntervalRef = useRef(null);

  useEffect(() => {
    const isProduction = process.env.REACT_APP_ENV === "production";
    let wsUrl = isProduction
      ? `wss://${process.env.REACT_APP_WS_SERVER}`
      : `ws://${process.env.REACT_APP_WS_SERVER}:${process.env.REACT_APP_WS_SERVER_PORT}`;

    function connectToWs() {
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = function () {
        setWs(websocket);
        setConnectedToWs(true);
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      };

      websocket.onmessage = function (e) {
        const parsed = JSON.parse(e.data);
        setOutput(parsed);
      };

      websocket.onclose = function () {
        setConnectedToWs(false);
        retryConnection();
      };
    }

    function retryConnection() {
      if (!retryIntervalRef.current) {
        retryIntervalRef.current = setInterval(connectToWs, 5000);
      }
    }

    connectToWs();

    return () => {
      ws?.close();
      clearInterval(retryIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (wasInitialRequestSent) {
      return;
    }

    if (ws) {
      sendScriptToWsServer(sampleScript);
      setInitialRequestSent(true);
    }
  }, [ws]);

  function sendScriptToWsServer(code) {
    setOutput(null);
    ws.send(code);
  }

  return (
    <>
      <Header />
      <Suspense fallback={<LoadingPlayground />}>
        <Playground
          isConnectedToWs={isConnectedToWs}
          onCodeEditorChange={sendScriptToWsServer}
          output={output}
          sampleScript={sampleScript}
        />
      </Suspense>
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
