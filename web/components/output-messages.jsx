export function OutputMessages({ message }) {
  if (!Array.isArray(message)) {
    return message;
  }

  return (
    <ul>
      {message.map((elem, idx) => (
        <li key={idx} className="-ml-2">
          {elem.map((item, idx) => (
            <pre className="pl-2 text-sm" key={idx}>
              {typeof item === "object"
                ? JSON.stringify(item, null, "\t")
                : String(item)}
            </pre>
          ))}
        </li>
      ))}
    </ul>
  );
}
