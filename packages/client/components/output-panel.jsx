import { Loader2 } from "lucide-react";
import { Output } from "@/components/output";

export function OutputPanel({ output, isConnectedToWs }) {
  return (
    <div className="h-screen bg-slate-200">
      <div className="p-5">
        <span className="block mb-4 text-lg font-bold">Output</span>
        {!isConnectedToWs ? (
          <Loader2 className="rotating" />
        ) : output ? (
          <Output isError={output.type === "error"} message={output.message} />
        ) : null}
      </div>
    </div>
  );
}
