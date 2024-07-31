import React, { useEffect, useRef, useState } from 'react';
import { html as LangHtml } from '@codemirror/lang-html';
import { javascript as LangJavascript } from '@codemirror/lang-javascript';
import { css as LangCss } from '@codemirror/lang-css';
import TextEditor from './TextEditor';

function App() {
  const [html, setHtml] = useState(`<html>\n<head>\n\t<title>Document</title>\n</head>\n<body>\n\t<h1>Hello world!</h1>\n</body>\n</html>`)
  const [javascript, setJavascript] = useState(`console.log('hello world!');`)
  const [css, setCss] = useState(`h1 {\n\tbackground: green; \n}`)
  const wsRef = useRef(null)

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8081/")
    wsRef.current.onopen = function () {
      console.log("connected to server")
    }
  }, [])

  function sendStaticHtmlToWebSocketServer() {
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
    wsRef.current.send(updatedHtml)
  }

  return (
    <div>
      <h1>Welcome to Javascript Playground!</h1>
      <div style={{ display: "flex" }}>
        <div style={{ flexGrow: "1" }}>
          <TextEditor
            value={html}
            onChange={(value) => {
              sendStaticHtmlToWebSocketServer()
              setHtml(value)
            }}
            extensions={[LangHtml()]}
            height="200px"
          />
          <hr />
          <TextEditor
            value={javascript}
            onChange={(value) => {
              sendStaticHtmlToWebSocketServer()
              setJavascript(value)
            }}
            extensions={[LangJavascript()]}
            height="200px"
          />
          <hr />
          <TextEditor
            value={css}
            onChange={(value) => {
              sendStaticHtmlToWebSocketServer()
              setCss(value)
            }}
            extensions={[LangCss()]}
            height="200px"
          />
        </div>
        <div style={{ flexGrow: "1" }}>
          <iframe src="http://localhost:8082" width="100%" />
        </div>
      </div>
    </div >
  );
};

export default App;