import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  args: Record<string, any>;
  toolName: string;
  state: "result" | "call" | string;
  result?: any;
}

interface ToolIndicatorProps {
  tool: ToolInvocation;
}

const getFileOperationMessage = (toolName: string, args: Record<string, any>): string => {
  if (toolName === "str_replace_editor") {
    const { command, path } = args;
    const filename = path ? path.split('/').pop() || path : 'file';
    
    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
        return `Editing ${filename}`;
      case "insert":
        return `Adding content to ${filename}`;
      case "view":
        return `Reading ${filename}`;
      default:
        return `Working on ${filename}`;
    }
  }
  
  if (toolName === "file_manager") {
    const { command, path, new_path } = args;
    const filename = path ? path.split('/').pop() || path : 'file';
    const newFilename = new_path ? new_path.split('/').pop() || new_path : 'file';
    
    switch (command) {
      case "rename":
        return `Renaming ${filename} to ${newFilename}`;
      case "delete":
        return `Deleting ${filename}`;
      default:
        return `Managing ${filename}`;
    }
  }
  
  return toolName.replace(/_/g, ' ');
};

export function ToolIndicator({ tool }: ToolIndicatorProps) {
  const message = getFileOperationMessage(tool.toolName, tool.args);
  const isCompleted = tool.state === "result" && tool.result;
  
  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}