import { objectLiteralToString } from "@/lib/object-literal-to-string";

export function OutputMessages({ message }) {
  if (!Array.isArray(message)) {
    return message;
  }

  return (
    <ul>
      {message.map((elem, idx) => (
        <li key={idx} className="-ml-2">
          {elem.map((item, idx) => (
            <pre
              id="output-message"
              className="pl-2 mb-2 text-sm text-slate-500"
              key={idx}
            >
              {typeof item === "object"
                ? objectLiteralToString(item)
                : String(item)}
            </pre>
          ))}
        </li>
      ))}
    </ul>
  );
}
