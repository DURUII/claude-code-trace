use serde::Serialize;

/// ToolCategory classifies tool calls into broad functional groups.
/// Used by the GUI to assign per-category icons and colors.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub enum ToolCategory {
    Read,
    Edit,
    Write,
    Bash,
    Grep,
    Glob,
    Task,
    Tool,
    Web,
    Other,
}

/// CategorizeToolName maps a raw tool name to a ToolCategory.
pub fn categorize_tool_name(name: &str) -> ToolCategory {
    match name {
        // Claude Code tools
        "Read" => ToolCategory::Read,
        "Edit" => ToolCategory::Edit,
        "Write" | "NotebookEdit" => ToolCategory::Write,
        "Bash" => ToolCategory::Bash,
        "Grep" => ToolCategory::Grep,
        "Glob" => ToolCategory::Glob,
        "Task" | "Agent" => ToolCategory::Task,
        "Skill" => ToolCategory::Tool,
        "WebFetch" | "WebSearch" => ToolCategory::Web,

        // Codex tools
        "shell_command" | "exec_command" | "write_stdin" | "shell" => ToolCategory::Bash,
        "apply_patch" => ToolCategory::Edit,

        // Gemini tools
        "read_file" => ToolCategory::Read,
        "write_file" | "edit_file" => ToolCategory::Write,
        "run_command" | "execute_command" => ToolCategory::Bash,
        "search_files" | "grep" => ToolCategory::Grep,

        // OpenCode tools (lowercase variants)
        "read" => ToolCategory::Read,
        "edit" => ToolCategory::Edit,
        "write" => ToolCategory::Write,
        "bash" => ToolCategory::Bash,
        "glob" => ToolCategory::Glob,
        "task" => ToolCategory::Task,

        // Copilot tools
        "view" => ToolCategory::Read,
        "report_intent" => ToolCategory::Tool,

        // Cursor tools
        "Shell" => ToolCategory::Bash,
        "StrReplace" => ToolCategory::Edit,
        "LS" => ToolCategory::Read,

        _ => ToolCategory::Other,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn claude_code_tools() {
        assert_eq!(categorize_tool_name("Read"), ToolCategory::Read);
        assert_eq!(categorize_tool_name("Edit"), ToolCategory::Edit);
        assert_eq!(categorize_tool_name("Write"), ToolCategory::Write);
        assert_eq!(categorize_tool_name("NotebookEdit"), ToolCategory::Write);
        assert_eq!(categorize_tool_name("Bash"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("Grep"), ToolCategory::Grep);
        assert_eq!(categorize_tool_name("Glob"), ToolCategory::Glob);
        assert_eq!(categorize_tool_name("Task"), ToolCategory::Task);
        assert_eq!(categorize_tool_name("Agent"), ToolCategory::Task);
        assert_eq!(categorize_tool_name("Skill"), ToolCategory::Tool);
        assert_eq!(categorize_tool_name("WebFetch"), ToolCategory::Web);
        assert_eq!(categorize_tool_name("WebSearch"), ToolCategory::Web);
    }

    #[test]
    fn codex_tools() {
        assert_eq!(categorize_tool_name("shell_command"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("exec_command"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("write_stdin"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("shell"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("apply_patch"), ToolCategory::Edit);
    }

    #[test]
    fn gemini_tools() {
        assert_eq!(categorize_tool_name("read_file"), ToolCategory::Read);
        assert_eq!(categorize_tool_name("write_file"), ToolCategory::Write);
        assert_eq!(categorize_tool_name("edit_file"), ToolCategory::Write);
        assert_eq!(categorize_tool_name("run_command"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("execute_command"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("search_files"), ToolCategory::Grep);
        assert_eq!(categorize_tool_name("grep"), ToolCategory::Grep);
    }

    #[test]
    fn opencode_tools() {
        assert_eq!(categorize_tool_name("read"), ToolCategory::Read);
        assert_eq!(categorize_tool_name("edit"), ToolCategory::Edit);
        assert_eq!(categorize_tool_name("write"), ToolCategory::Write);
        assert_eq!(categorize_tool_name("bash"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("glob"), ToolCategory::Glob);
        assert_eq!(categorize_tool_name("task"), ToolCategory::Task);
    }

    #[test]
    fn copilot_tools() {
        assert_eq!(categorize_tool_name("view"), ToolCategory::Read);
        assert_eq!(categorize_tool_name("report_intent"), ToolCategory::Tool);
    }

    #[test]
    fn cursor_tools() {
        assert_eq!(categorize_tool_name("Shell"), ToolCategory::Bash);
        assert_eq!(categorize_tool_name("StrReplace"), ToolCategory::Edit);
        assert_eq!(categorize_tool_name("LS"), ToolCategory::Read);
    }

    #[test]
    fn unknown_tool() {
        assert_eq!(categorize_tool_name("foobar"), ToolCategory::Other);
        assert_eq!(categorize_tool_name(""), ToolCategory::Other);
        assert_eq!(categorize_tool_name("SomeRandomTool"), ToolCategory::Other);
    }
}
