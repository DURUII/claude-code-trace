use std::fs;
use std::path::{Path, PathBuf};

/// Returns a display name for a project directory.
pub fn project_name(cwd: &str, git_branch: &str) -> String {
    if cwd.is_empty() {
        return String::new();
    }
    let cleaned = Path::new(cwd).to_path_buf();

    if let Some(root) = find_git_repo_root(&cleaned) {
        return root
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();
    }

    let name = cleaned
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();
    trim_branch_suffix(&name, git_branch)
}

/// Returns the git toplevel for the given directory. If the directory is
/// inside a git worktree, resolves to the main working tree root.
/// Falls back to the original path if not a git repo.
pub fn resolve_git_root(dir: &str) -> String {
    if let Some(root) = find_git_repo_root(Path::new(dir)) {
        root.to_string_lossy().to_string()
    } else {
        dir.to_string()
    }
}

fn find_git_repo_root(dir: &Path) -> Option<PathBuf> {
    let mut current = if dir.is_dir() {
        dir.to_path_buf()
    } else {
        dir.parent()?.to_path_buf()
    };

    loop {
        let git_path = current.join(".git");
        if let Ok(meta) = fs::metadata(&git_path) {
            if meta.is_dir() {
                return Some(current);
            }
            if meta.is_file() {
                // Worktree: try to resolve main repo root
                if let Some(root) = repo_root_from_git_file(&current, &git_path) {
                    return Some(root);
                }
                return Some(current);
            }
        }
        if !current.pop() {
            return None;
        }
    }
}

fn repo_root_from_git_file(repo_dir: &Path, git_file: &Path) -> Option<PathBuf> {
    let content = fs::read_to_string(git_file).ok()?;
    let git_dir_str = content
        .lines()
        .find(|l| l.to_lowercase().starts_with("gitdir:"))?
        .trim_start_matches(|c: char| !c.is_ascii_whitespace() && c != ':')
        .trim_start_matches(':')
        .trim();

    let git_dir = if Path::new(git_dir_str).is_absolute() {
        PathBuf::from(git_dir_str)
    } else {
        git_file.parent()?.join(git_dir_str).canonicalize().ok()?
    };

    // Try commondir
    let common_dir_path = git_dir.join("commondir");
    if let Ok(common_content) = fs::read_to_string(&common_dir_path) {
        let common = common_content.trim();
        let common_path = if Path::new(common).is_absolute() {
            PathBuf::from(common)
        } else {
            git_dir.join(common).canonicalize().ok()?
        };
        if common_path.file_name().and_then(|n| n.to_str()) == Some(".git") {
            return common_path.parent().map(|p| p.to_path_buf());
        }
    }

    // Fallback: parse worktrees path
    let git_dir_str = git_dir.to_string_lossy();
    let marker = format!(
        "{}worktrees{}",
        std::path::MAIN_SEPARATOR,
        std::path::MAIN_SEPARATOR
    );
    if let Some(idx) = git_dir_str.find(&format!(".git{}", marker)) {
        let root = &git_dir_str[..idx];
        if !root.is_empty() {
            return Some(PathBuf::from(
                root.trim_end_matches(std::path::MAIN_SEPARATOR),
            ));
        }
    }

    Some(repo_dir.to_path_buf())
}

fn trim_branch_suffix(name: &str, git_branch: &str) -> String {
    let branch = git_branch.trim().trim_start_matches("refs/heads/");
    if name.is_empty() || branch.is_empty() {
        return name.to_string();
    }
    let branch_token = normalize_branch_token(branch);
    if branch_token.is_empty() || is_default_branch(&branch_token) {
        return name.to_string();
    }

    for sep in &["-", "_"] {
        let suffix = format!("{}{}", sep, branch_token);
        if name.to_lowercase().ends_with(&suffix.to_lowercase()) {
            let base = name[..name.len() - suffix.len()].trim_end_matches(&['-', '_'][..]);
            if !base.is_empty() {
                return base.to_string();
            }
        }
    }
    name.to_string()
}

fn normalize_branch_token(branch: &str) -> String {
    let mut result = String::with_capacity(branch.len());
    let mut last_dash = false;
    for c in branch.chars() {
        if c.is_alphanumeric() {
            result.push(c.to_lowercase().next().unwrap_or(c));
            last_dash = false;
        } else if !last_dash {
            result.push('-');
            last_dash = true;
        }
    }
    result.trim_matches('-').to_string()
}

fn is_default_branch(branch: &str) -> bool {
    matches!(
        branch.to_lowercase().as_str(),
        "main" | "master" | "trunk" | "develop" | "dev"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    // --- project_name tests ---

    #[test]
    fn project_name_empty_cwd_returns_empty() {
        assert_eq!(project_name("", ""), "");
    }

    #[test]
    fn project_name_path_returns_last_component() {
        // When there's no .git directory, project_name returns the last path component
        // (possibly trimmed of branch suffix). Use a path that won't have a .git dir.
        let name = project_name("/tmp/nonexistent-test-dir-xyz/my-project", "");
        assert_eq!(name, "my-project");
    }

    #[test]
    fn project_name_trims_branch_suffix() {
        let name = project_name(
            "/tmp/nonexistent-test-dir-xyz/my-project-feature-abc",
            "feature/abc",
        );
        assert_eq!(name, "my-project");
    }

    #[test]
    fn project_name_does_not_trim_default_branch() {
        let name = project_name("/tmp/nonexistent-test-dir-xyz/my-project", "main");
        assert_eq!(name, "my-project");
    }

    // --- trim_branch_suffix tests ---

    #[test]
    fn trim_branch_suffix_removes_matching_suffix() {
        assert_eq!(
            trim_branch_suffix("project-feature-abc", "feature/abc"),
            "project"
        );
    }

    #[test]
    fn trim_branch_suffix_no_match_returns_original() {
        assert_eq!(trim_branch_suffix("project", "feature/abc"), "project");
    }

    #[test]
    fn trim_branch_suffix_empty_branch_returns_original() {
        assert_eq!(trim_branch_suffix("project", ""), "project");
    }

    #[test]
    fn trim_branch_suffix_default_branch_returns_original() {
        assert_eq!(trim_branch_suffix("project-main", "main"), "project-main");
    }

    // --- is_default_branch tests ---

    #[test]
    fn is_default_branch_recognizes_defaults() {
        assert!(is_default_branch("main"));
        assert!(is_default_branch("master"));
        assert!(is_default_branch("trunk"));
        assert!(is_default_branch("develop"));
        assert!(is_default_branch("dev"));
    }

    #[test]
    fn is_default_branch_rejects_non_defaults() {
        assert!(!is_default_branch("feature/abc"));
        assert!(!is_default_branch("bugfix-123"));
        assert!(!is_default_branch(""));
    }

    // --- normalize_branch_token tests ---

    #[test]
    fn normalize_branch_token_converts_slashes_to_dashes() {
        assert_eq!(normalize_branch_token("feature/abc"), "feature-abc");
    }

    #[test]
    fn normalize_branch_token_lowercases() {
        assert_eq!(normalize_branch_token("Feature/ABC"), "feature-abc");
    }

    #[test]
    fn normalize_branch_token_collapses_separators() {
        assert_eq!(normalize_branch_token("a//b"), "a-b");
    }

    // --- resolve_git_root tests ---

    #[test]
    fn resolve_git_root_non_git_returns_original() {
        let dir = "/tmp/nonexistent-test-dir-xyz";
        assert_eq!(resolve_git_root(dir), dir);
    }
}
