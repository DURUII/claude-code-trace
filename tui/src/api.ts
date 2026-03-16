/** HTTP API client for the Claude Code Trace backend (port 11423). */

const API = "http://127.0.0.1:11423";

export interface SessionInfo {
  path: string;
  session_id: string;
  mod_time: string;
  first_message: string;
  turn_count: number;
  is_ongoing: boolean;
  total_tokens: number;
  cost_usd: number;
  duration_ms: number;
  model: string;
  cwd: string;
  git_branch: string;
  permission_mode: string;
}

export interface DisplayMessage {
  role: string;
  model: string;
  content: string;
  timestamp: string;
  thinking_count: number;
  tool_call_count: number;
  output_count: number;
  tokens_raw: number;
  duration_ms: number;
  items: DisplayItem[];
  is_error: boolean;
  subagent_label: string;
}

export interface DisplayItem {
  item_type: string;
  text: string;
  tool_name: string;
  tool_summary: string;
  tool_category: string;
  tool_error: boolean;
  duration_ms: number;
  subagent_messages: DisplayMessage[];
}

export interface LoadResult {
  messages: DisplayMessage[];
  path: string;
  ongoing: boolean;
  meta: { cwd: string; git_branch: string; permission_mode: string };
  session_totals: {
    total_tokens: number;
    cost_usd: number;
    model: string;
  };
}

export interface SettingsResponse {
  projects_dir: string | null;
  default_dir: string;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API ${path}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.statusText}`);
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  getSettings: () => get<SettingsResponse>("/api/settings"),
  getProjectDirs: () => get<string[]>("/api/project-dirs"),
  discoverSessions: (dirs: string[]) =>
    get<SessionInfo[]>(`/api/sessions?dirs=${encodeURIComponent(dirs.join(","))}`),
  loadSession: (path: string) => post<LoadResult>("/api/session/load", { path }),
  watchSession: (path: string) => post<void>("/api/session/watch", { path }),
  unwatchSession: () => post<void>("/api/session/unwatch"),
};
