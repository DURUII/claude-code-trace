cask "claude-code-trace" do
  version "0.4.0"
  sha256 :no_check

  url "https://github.com/delexw/claude-code-trace/releases/download/v#{version}/Claude.Code.Trace_#{version}_aarch64.dmg"
  name "Claude Code Trace"
  desc "Desktop + web viewer for Claude Code session JSONL files"
  homepage "https://github.com/delexw/claude-code-trace"

  app "Claude Code Trace.app"

  postflight do
    system_command "/usr/bin/xattr",
                   args: ["-cr", "#{appdir}/Claude Code Trace.app"],
                   sudo: false
  end

  zap trash: [
    "~/Library/Application Support/com.claudecodetrace.app",
    "~/Library/Caches/com.claudecodetrace.app",
  ]
end
