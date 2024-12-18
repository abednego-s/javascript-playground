export function objectLiteralToString(obj, indent = 0) {
  if (obj === null) return 'null';
  if (obj instanceof RegExp) return obj.toString();
  if (typeof obj === 'string') {
    if (obj.startsWith('[code]') && obj.endsWith('[/code]')) {
      return obj.slice(6, -7);
    }
    if (obj.includes('\n')) {
      const lines = obj.split('\n');
      const indentedLines = lines.map((line, index) => {
        if (index === 0) return '`' + line;
        if (index === lines.length - 1)
          return ' '.repeat(indent * 2 + 2) + line + '`';
        return ' '.repeat(indent * 2 + 2) + line;
      });
      return indentedLines.join('\n');
    }
    return `'${obj.replace(/'/g, "\\'")}'`;
  }
  if (typeof obj !== 'object') return JSON.stringify(obj);

  const spaces = ' '.repeat(indent * 2);
  const nextIndent = indent + 1;

  if (Array.isArray(obj)) {
    const elements = obj
      .map((item) => objectLiteralToString(item, nextIndent))
      .join(',\n' + ' '.repeat(nextIndent * 2));
    return `[\n${' '.repeat(nextIndent * 2)}${elements}\n${spaces}]`;
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';

  const props = entries
    .map(([key, value]) => {
      const formattedValue = objectLiteralToString(value, nextIndent);
      const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
      const formattedKey = validIdentifier
        ? key
        : `'${key.replace(/'/g, "\\'")}'`;
      return `${spaces}  ${formattedKey}: ${formattedValue}`;
    })
    .join(',\n');

  return `{\n${props}\n${spaces}}`;
}