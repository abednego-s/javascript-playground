import { Output } from "@/components/output";

export function OutputPanel({ output }) {
  return (
    <div className="h-screen bg-slate-200">
      <div className="p-5">
        <span className="block mb-4 text-lg font-bold">Output</span>
        {output ? (
          <Output isError={output.type === "error"} message={output.message} />
        ) : null}
      </div>
    </div>
  );
}
