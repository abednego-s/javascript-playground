import React, { useEffect, useState } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import TextEditor from './TextEditor';

const defaultScript = `console.log('hello world!');`

function App() {
  const [ws, setWs] = useState(null)
  const [consoleLogs, setConsoleLogs] = useState(null)

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8081/")

    websocket.onopen = function () {
      setWs(websocket)
    }
    websocket.onmessage = function (e) {
      const parsed = JSON.parse(e.data)
      setConsoleLogs(parsed)
    }

    return () => {
      websocket.close()
    }
  }, [])

  function sendScriptToWsServer(code) {
    setConsoleLogs(null)
    ws.send(code)
  }

  return (
    <div>
      <h1>Welcome to Javascript Playground!</h1>
      <div className="flex">
        <div className="flex-grow">
          <TextEditor
            value={defaultScript}
            onChange={sendScriptToWsServer}
            extensions={[javascript()]}
            height="200px"
          />
        </div>
        <div style={{ flexGrow: "1" }}>
          <div>
            <h2>Console</h2>
            <div>{JSON.stringify(consoleLogs)}</div>
            {/* <ul>
              {consoleLogs.map(
                (log, index) =>
                  <div key={index}>
                    <div>
                      {log.map((item, index) =>
                        <span key={index}>{typeof item === "object" ? JSON.stringify(item) : item}</span>
                      )}
                    </div>
                  </div>
              )}
            </ul> */}
          </div>
        </div>
      </div>
    </div >
  );
};

export default App;