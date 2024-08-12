import React, { useEffect, useState } from 'react';
import { html as LangHtml } from '@codemirror/lang-html';
import { javascript as LangJavascript } from '@codemirror/lang-javascript';
import { css as LangCss } from '@codemirror/lang-css';
import TextEditor from './TextEditor';

function App() {
  const [html, setHtml] = useState(`<html>\n<head>\n\t<title>Document</title>\n</head>\n<body>\n\t<h1>Hello world!</h1>\n</body>\n</html>`)
  const [javascript, setJavascript] = useState(`console.log('hello world!');`)
  const [css, setCss] = useState(`h1 {\n\tbackground: green; \n}`)
  const [ws, setWs] = useState(null)
  const [consoleLogs, setConsoleLogs] = useState(null)

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8081/")

    websocket.onopen = function () {
      console.info("Web app is connected to WebSocket server")
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

  function sendPageToWebSocketServer() {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const head = doc.getElementsByTagName("head")[0]

    const styleElement = document.createElement("style")
    styleElement.textContent = `\n${css}`
    head.appendChild(styleElement)

    const scriptElement = document.createElement("script")
    scriptElement.textContent = `\n${javascript}`
    head.appendChild(scriptElement)

    const serializer = new XMLSerializer();
    const updatedHtml = serializer.serializeToString(doc)
    const request = { type: "page", message: updatedHtml }
    ws.send(JSON.stringify(request))
  }

  function sendScriptToWebSocketServer(code) {
    // const request = { type: "script", message: code }
    setConsoleLogs(null)
    try {
      console.log(`sending `, code, ` to ws`);
      ws.send(code)
    } catch (err) {
      throw Error("Error ", err)
    }
  }

  return (
    <div>
      <h1>Welcome to Javascript Playground!</h1>
      <div><button onClick={sendPageToWebSocketServer}>Run code</button></div>
      {/* <div><button onClick={sendScriptToWebSocketServer}>Run JS</button></div> */}
      <div style={{ display: "flex" }}>
        <div style={{ flexGrow: "1" }}>
          <TextEditor
            value={html}
            onChange={(value) => {
              // sendPageToWebSocketServer()
              setHtml(value)
            }}
            extensions={[LangHtml()]}
            height="200px"
          />
          <hr />
          <TextEditor
            value={javascript}
            onChange={(value) => {
              sendScriptToWebSocketServer(value)
              // setJavascript(value)
            }}
            extensions={[LangJavascript()]}
            height="200px"
          />
          <hr />
          <TextEditor
            value={css}
            onChange={(value) => {
              // sendPageToWebSocketServer()
              setCss(value)
            }}
            extensions={[LangCss()]}
            height="200px"
          />
        </div>
        <div style={{ flexGrow: "1" }}>
          {/* <iframe src="http://localhost:8082" width="100%" /> */}
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