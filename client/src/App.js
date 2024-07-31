import React, { useState } from 'react';
import { html as LangHtml } from '@codemirror/lang-html';
import { javascript as LangJavascript } from '@codemirror/lang-javascript';
import { css as LangCss } from '@codemirror/lang-css';
import TextEditor from './TextEditor';

function App() {
  const [html, setHtml] = useState(`<html>\n<head>\n\t<title>Document</title>\n</head>\n<body>\n\t<h1>Hello world!</h1>\n</body>\n</html>`)
  const [javascript, setJavascript] = useState(`console.log('hello world!');`)
  const [css, setCss] = useState(`h1 {\n\tbackground: green; \n}`)

  return (
    <div>
      <h1>Welcome to Javascript Playground!</h1>
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
  );
};

export default App;