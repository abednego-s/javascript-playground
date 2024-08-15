import React, { useEffect, useState } from 'react';
import { html as LangHtml } from '@codemirror/lang-html';
import { javascript as LangJavascript } from '@codemirror/lang-javascript';
import { css as LangCss } from '@codemirror/lang-css';
import TextEditor from './TextEditor';

const html = `<html>\n<head>\n\t<title>Document</title>\n</head>\n<body>\n\t<h1>Hello World</h1>\n</body>\n</html>`
const javascript = `console.log('hello world!');`
const css = `h1 {\n\tcolor: green; \n}`

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

  function broadcastContent(type, content) {
    const channel = new BroadcastChannel("channel-1")
    channel.postMessage({ type, content })
  }

  return (
    <div>
      <h1>Welcome to Javascript Playground!</h1>
      <div style={{ display: "flex" }}>
        <div style={{ flexGrow: "1" }}>
          <TextEditor
            value={html}
            onChange={(value) => broadcastContent("html", value)}
            extensions={[LangHtml()]}
            height="200px"
          />
          <hr />
          <TextEditor
            value={javascript}
            onChange={(value) => {
              sendScriptToWsServer(value)
              broadcastContent("javascript", value)
            }}
            extensions={[LangJavascript()]}
            height="200px"
          />
          <hr />
          <TextEditor
            value={css}
            onChange={(value) => { broadcastContent("css", value) }}
            extensions={[LangCss()]}
            height="200px"
          />
        </div>
        <div style={{ flexGrow: "1" }}>
          <iframe src="http://localhost:3000/webview" width="100%" />
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