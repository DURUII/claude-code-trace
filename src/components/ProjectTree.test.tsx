import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectTree } from "./ProjectTree";
import type { SessionInfo } from "../types";

function makeSession(overrides: Partial<SessionInfo> = {}): SessionInfo {
  return {
    path: "/home/user/.claude/projects/my-project/session1.jsonl",
    session_id: "session1",
    mod_time: "2025-01-01T00:00:00Z",
    first_message: "Hello",
    turn_count: 3,
    is_ongoing: false,
    total_tokens: 1000,
    input_tokens: 500,
    output_tokens: 500,
    cache_read_tokens: 0,
    cache_creation_tokens: 0,
    cost_usd: 0.01,
    duration_ms: 5000,
    model: "claude-sonnet-4-20250514",
    cwd: "/home/user/my-project",
    git_branch: "main",
    permission_mode: "default",
    ...overrides,
  };
}

describe("ProjectTree", () => {
  it("shows All Projects with total count", () => {
    const sessions = [
      makeSession(),
      makeSession({ path: "/home/user/.claude/projects/my-project/session2.jsonl" }),
    ];
    render(
      <ProjectTree
        sessions={sessions}
        selectedProject={null}
        onSelectProject={vi.fn()}
        onRefresh={vi.fn()}
      />,
    );
    expect(screen.getByText("All Projects")).toBeInTheDocument();
    // Total count should be 2
    const allItem = screen.getByText("All Projects").closest(".project-tree__item")!;
    expect(allItem.querySelector(".project-tree__count")!.textContent).toBe("2");
  });

  it("groups sessions by project key", () => {
    const sessions = [
      makeSession({
        path: "/home/user/.claude/projects/proj-a/s1.jsonl",
        cwd: "/home/user/proj-a",
      }),
      makeSession({
        path: "/home/user/.claude/projects/proj-a/s2.jsonl",
        cwd: "/home/user/proj-a",
      }),
      makeSession({
        path: "/home/user/.claude/projects/proj-b/s3.jsonl",
        cwd: "/home/user/proj-b",
      }),
    ];
    render(
      <ProjectTree
        sessions={sessions}
        selectedProject={null}
        onSelectProject={vi.fn()}
        onRefresh={vi.fn()}
      />,
    );
    expect(screen.getByText("proj-a")).toBeInTheDocument();
    expect(screen.getByText("proj-b")).toBeInTheDocument();
  });

  it("shows ongoing dot for projects with ongoing sessions", () => {
    const sessions = [
      makeSession({
        path: "/home/user/.claude/projects/proj-a/s1.jsonl",
        cwd: "/home/user/proj-a",
        is_ongoing: true,
      }),
    ];
    render(
      <ProjectTree
        sessions={sessions}
        selectedProject={null}
        onSelectProject={vi.fn()}
        onRefresh={vi.fn()}
      />,
    );
    const projItem = screen.getByText("proj-a").closest(".project-tree__item")!;
    expect(projItem.querySelector(".project-tree__ongoing-dot")).toBeInTheDocument();
  });

  it("does not show ongoing dot when no ongoing sessions", () => {
    const sessions = [
      makeSession({
        path: "/home/user/.claude/projects/proj-a/s1.jsonl",
        cwd: "/home/user/proj-a",
        is_ongoing: false,
      }),
    ];
    render(
      <ProjectTree
        sessions={sessions}
        selectedProject={null}
        onSelectProject={vi.fn()}
        onRefresh={vi.fn()}
      />,
    );
    const projItem = screen.getByText("proj-a").closest(".project-tree__item")!;
    expect(projItem.querySelector(".project-tree__ongoing-dot")).not.toBeInTheDocument();
  });

  it("highlights selected project", () => {
    const sessions = [
      makeSession({
        path: "/home/user/.claude/projects/proj-a/s1.jsonl",
        cwd: "/home/user/proj-a",
      }),
    ];
    render(
      <ProjectTree
        sessions={sessions}
        selectedProject="proj-a"
        onSelectProject={vi.fn()}
        onRefresh={vi.fn()}
      />,
    );
    const projItem = screen.getByText("proj-a").closest(".project-tree__item")!;
    expect(projItem).toHaveClass("project-tree__item--selected");
  });

  it("highlights All Projects when selectedProject is null", () => {
    render(
      <ProjectTree
        sessions={[makeSession()]}
        selectedProject={null}
        onSelectProject={vi.fn()}
        onRefresh={vi.fn()}
      />,
    );
    const allItem = screen.getByText("All Projects").closest(".project-tree__item")!;
    expect(allItem).toHaveClass("project-tree__item--selected");
  });

  it("clicking All Projects calls onSelectProject(null)", () => {
    const onSelectProject = vi.fn();
    render(
      <ProjectTree
        sessions={[makeSession()]}
        selectedProject={null}
        onSelectProject={onSelectProject}
        onRefresh={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("All Projects"));
    expect(onSelectProject).toHaveBeenCalledWith(null);
  });

  it("clicking a project calls onSelectProject with key", () => {
    const onSelectProject = vi.fn();
    const sessions = [
      makeSession({
        path: "/home/user/.claude/projects/proj-a/s1.jsonl",
        cwd: "/home/user/proj-a",
      }),
    ];
    render(
      <ProjectTree
        sessions={sessions}
        selectedProject={null}
        onSelectProject={onSelectProject}
        onRefresh={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("proj-a"));
    expect(onSelectProject).toHaveBeenCalledWith("proj-a");
  });

  it("refresh button calls onRefresh", () => {
    const onRefresh = vi.fn();
    render(
      <ProjectTree
        sessions={[makeSession()]}
        selectedProject={null}
        onSelectProject={vi.fn()}
        onRefresh={onRefresh}
      />,
    );
    fireEvent.click(screen.getByTitle("Refresh all projects"));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("applies custom style prop", () => {
    const { container } = render(
      <ProjectTree
        sessions={[]}
        selectedProject={null}
        onSelectProject={vi.fn()}
        onRefresh={vi.fn()}
        style={{ width: "300px" }}
      />,
    );
    const tree = container.querySelector(".project-tree")!;
    expect(tree).toHaveStyle({ width: "300px" });
  });
});
