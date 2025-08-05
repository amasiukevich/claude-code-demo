import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolIndicator } from "../ToolIndicator";

afterEach(() => {
  cleanup();
});

test("ToolIndicator shows creating message for str_replace_editor create command", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "create", path: "src/components/Button.tsx" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("ToolIndicator shows editing message for str_replace_editor str_replace command", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "str_replace", path: "src/App.jsx" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("ToolIndicator shows adding content message for str_replace_editor insert command", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "insert", path: "README.md" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Adding content to README.md")).toBeDefined();
});

test("ToolIndicator shows reading message for str_replace_editor view command", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "view", path: "package.json" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Reading package.json")).toBeDefined();
});

test("ToolIndicator shows working message for str_replace_editor unknown command", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "unknown", path: "test.js" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Working on test.js")).toBeDefined();
});

test("ToolIndicator shows renaming message for file_manager rename command", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "rename", path: "old-file.js", new_path: "new-file.js" },
    toolName: "file_manager",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Renaming old-file.js to new-file.js")).toBeDefined();
});

test("ToolIndicator shows deleting message for file_manager delete command", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "delete", path: "temp-file.tmp" },
    toolName: "file_manager",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Deleting temp-file.tmp")).toBeDefined();
});

test("ToolIndicator shows managing message for file_manager unknown command", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "unknown", path: "some-file.txt" },
    toolName: "file_manager",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Managing some-file.txt")).toBeDefined();
});

test("ToolIndicator shows completed state with green dot for successful results", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "create", path: "Button.tsx" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  const { container } = render(<ToolIndicator tool={tool} />);
  
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();
  
  const loadingSpinner = container.querySelector(".animate-spin");
  expect(loadingSpinner).toBeNull();
});

test("ToolIndicator shows loading state with spinner for non-completed tasks", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "create", path: "Button.tsx" },
    toolName: "str_replace_editor",
    state: "call",
  };

  const { container } = render(<ToolIndicator tool={tool} />);
  
  const loadingSpinner = container.querySelector(".animate-spin");
  expect(loadingSpinner).toBeDefined();
  
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeNull();
});

test("ToolIndicator shows loading state when result is empty", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "create", path: "Button.tsx" },
    toolName: "str_replace_editor",
    state: "result",
    result: null,
  };

  const { container } = render(<ToolIndicator tool={tool} />);
  
  const loadingSpinner = container.querySelector(".animate-spin");
  expect(loadingSpinner).toBeDefined();
  
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeNull();
});

test("ToolIndicator handles path with multiple directories", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "create", path: "src/components/ui/Button.tsx" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("ToolIndicator handles missing path gracefully", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "create" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Creating file")).toBeDefined();
});

test("ToolIndicator handles unknown tool name", () => {
  const tool = {
    toolCallId: "test-id",
    args: {},
    toolName: "unknown_tool_name",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("unknown tool name")).toBeDefined();
});

test("ToolIndicator converts underscores to spaces in unknown tool names", () => {
  const tool = {
    toolCallId: "test-id",
    args: {},
    toolName: "some_complex_tool_name",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("some complex tool name")).toBeDefined();
});

test("ToolIndicator handles empty path", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "create", path: "" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Creating file")).toBeDefined();
});

test("ToolIndicator handles path with only directory separator", () => {
  const tool = {
    toolCallId: "test-id",
    args: { command: "create", path: "src/" },
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolIndicator tool={tool} />);
  expect(screen.getByText("Creating src/")).toBeDefined();
});