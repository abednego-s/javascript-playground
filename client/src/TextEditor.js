import React from 'react';
import CodeMirror from '@uiw/react-codemirror';

function TextEditor({ height, extensions, value, onChange }) {
  return <CodeMirror
    value={value}
    height={height}
    extensions={extensions}
    onChange={onChange}
  />;
}

export default TextEditor;
