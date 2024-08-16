import { ScrollArea } from "@/components/ui/scroll-area";

export function Output({ output }) {
  return (
    <div className="bg-slate-200 h-screen">
      <div className="p-5">
        <span className="block text-lg font-bold mb-4">Output</span>
        {output ? (
          <div
            className={`${
              output?.type === "error" ? "text-red-400" : "text-slate-800"
            }`}
          >
            <ScrollArea className="h-[600px] pb-40">
              {output.message && Array.isArray(output.message) ? (
                <ul>
                  {output.message.map((log, index) => (
                    <li key={index}>
                      {log.map((item, index) => (
                        <span key={index}>
                          {typeof item === "object" ? (
                            <pre>{JSON.stringify(item, null, "\t")}</pre>
                          ) : (
                            item
                          )}
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                output.message
              )}
            </ScrollArea>
          </div>
        ) : null}
      </div>
    </div>
  );
}
