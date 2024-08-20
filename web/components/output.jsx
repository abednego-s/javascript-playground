import { ScrollArea } from "@/components/ui/scroll-area";
import { OutputMessages } from "@/components/output-messages";

export function Output({ isError, message }) {
  return (
    <div className={`${isError ? "text-red-400" : "text-slate-800"}`}>
      <ScrollArea className="h-[600px] pb-40 noto-sans-mono">
        <OutputMessages message={message} />
      </ScrollArea>
    </div>
  );
}
