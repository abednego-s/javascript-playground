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

  function sendDataToWs() {
    wsRef.current.send(html)
  }

  return (
    <div>
      <h1>Welcome to Javascript Playground!</h1>
      <button onClick={sendDataToWs}>Test</button>
      <div style={{ display: "flex" }}>
        <div style={{ flexGrow: "1" }}>
          <TextEditor
            value={html}
            onChange={(value) => setHtml(value)}
            extensions={[LangHtml()]}
            height="200px"
          />
          <hr />
          <TextEditor
            value={javascript}
            onChange={(value) => setJavascript(value)}
            extensions={[LangJavascript()]}
            height="200px"
          />
          <hr />
          <TextEditor
            value={css}
            onChange={(value) => setCss(value)}
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