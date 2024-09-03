import { useMediaQuery } from "@uidotdev/usehooks";
import ReactCodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OutputPanel } from "@/components/output-panel";

export function Playground({
  isConnectedToWs,
  onCodeEditorChange,
  output,
  sampleScript,
}) {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  return (
    <ResizablePanelGroup direction={isSmallDevice ? "vertical" : "horizontal"}>
      <ResizablePanel>
        <ReactCodeMirror
          value={sampleScript}
          onChange={onCodeEditorChange}
          extensions={[javascript()]}
          theme={okaidia}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <OutputPanel output={output} isConnectedToWs={isConnectedToWs} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
