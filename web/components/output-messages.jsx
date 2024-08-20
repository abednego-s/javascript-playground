export function OutputMessages({ message }) {
  if (!Array.isArray(message)) {
    return message;
  }

  return (
    <ul>
      {message.map((elem, idx) => (
        <li key={idx}>
          {elem.map((item, idx) => (
            <span key={idx}>
              {typeof item === "object" ? (
                <pre>{JSON.stringify(item, null, "\t")}</pre>
              ) : (
                String(item)
              )}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}
