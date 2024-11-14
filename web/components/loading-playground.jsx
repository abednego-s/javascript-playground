import { Loader2 } from "lucide-react";

export function LoadingPlayground() {
  return (
    <div className="flex flex-col justify-center pt-16 space-y-4">
      <p className="mt-10 text-xl font-bold text-center">
        Loading playground... Please wait
      </p>
      <p className="flex justify-center">
        <Loader2 className="rotating" />
      </p>
    </div>
  );
}
