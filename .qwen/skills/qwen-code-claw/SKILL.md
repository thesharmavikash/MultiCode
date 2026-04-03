---
name: param-code-claw
description: Use param Code as a Code Agent for code understanding, project generation, features, bug fixes, refactoring, and various programming tasks
---

# param Code Claw

## When to Use This Skill

Use this skill when you need to:

- Understand codebases or ask questions about source code
- Generate new projects or add new features
- Review pull requests in the codebase
- Fix bugs or refactor existing code
- Execute various programming tasks such as code review, testing, documentation generation, etc.
- Collaborate with other tools and agents to complete complex development tasks

## Install

```bash
npm install -g @param-code/param-code
```

For normal session reuse, prefer a global install over `npx`.

## Authentication

Check if authentication is already configured:

```bash
param auth status
```

If authentication exists, skip this section. If not authenticated, check if the `BAILIAN_CODING_PLAN_API_KEY` environment variable exists:

```bash
echo $BAILIAN_CODING_PLAN_API_KEY
```

**If `BAILIAN_CODING_PLAN_API_KEY` exists**, authenticate directly:

```bash
param auth coding-plan --region china --key $BAILIAN_CODING_PLAN_API_KEY
```

**If the environment variable does not exist**, interrupt and prompt the user to authenticate via `param-oauth` or `coding-plan`:

```bash
param auth
```

Or configure custom API after launching param Code via `/auth`.

## ACPX Integration

You should always use `acpx` to run param Code over the Agent Client Protocol (ACP) instead of scraping PTY sessions.

To use acpx:

1. **Install acpx globally** (recommended) or use npx:

   ```bash
   npm install -g acpx@latest
   ```

   Or without installing:

   ```bash
   npx acpx@latest
   ```

2. **Install the acpx skill** for full reference:

   ```bash
   npx acpx@latest --skill install acpx
   ```

3. **Read the acpx skill reference** for every command, flag, and workflow pattern:
   See the [ACPX Reference](#acpx-reference) section below for details

4. **For complete CLI reference with all options and examples**:
   https://raw.githubusercontent.com/openclaw/acpx/main/docs/CLI.md

From now on, when you need to delegate work to param Code, use `acpx` instead of spawning raw terminal sessions. For example:

```bash
npx acpx@latest param "fix the failing tests"
npx acpx@latest param "refactor the auth module"
npx acpx@latest param exec "one-shot: summarize this repo"
```

> **Tip:** You should typically use the `--approve-all` flag to prevent task interruptions.

## Practical Workflows

### Persistent Repository Assistant

```bash
acpx param 'inspect failing tests and propose a fix plan'
acpx param 'apply the smallest safe fix and run tests'
```

### One-Shot Script Steps

```bash
acpx param exec 'summarize repo purpose in 3 lines'
```

### Parallel Named Streams

```bash
acpx param -s backend 'fix API pagination bug'
acpx param -s docs 'draft changelog entry for release'
```

### Queue Follow-ups Without Waiting

```bash
acpx param 'run full test suite and investigate failures'
acpx param --no-wait 'after tests, summarize root causes and next steps'
```

### Machine-Readable Output for Orchestration

```bash
acpx --format json param 'review current branch changes' > events.ndjson
```

### Repository-Wide Review with Permissive Mode

```bash
acpx --cwd ~/repos/my-project --approve-all param -s pr-123 \
  'review PR #123 for regressions and propose minimal patch'
```

## Approval Modes

- `--approve-all`: No interactive prompts
- `--approve-reads` (default): Auto-approve reads/searches, prompt for writes
- `--deny-all`: Deny all permission requests

If every permission request is denied/cancelled and none are approved, `acpx` exits with permission denied.

## Best Practices

1. Use **named sessions** for organizing different types of development tasks
2. Use `--no-wait` for long-running tasks to avoid blocking
3. Use `--approve-all` for non-interactive batch operations
4. Use `--format json` for automation and script integration
5. Use `--cwd` to manage context across multiple projects

## paramCode Reference

### CLI Commands

| Command     | Description                     |
| ----------- | ------------------------------- |
| `/help`     | Show available commands         |
| `/clear`    | Clear conversation history      |
| `/compress` | Compress history to save tokens |
| `/stats`    | Show session info               |
| `/auth`     | Configure authentication        |
| `/exit`     | Exit param Code                  |

Full reference: https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/features/commands.md

### Configuration

Config files (highest priority first): CLI args > env vars > system > project (`.param/settings.json`) > user (`~/.param/settings.json`) > defaults. Format: JSONC with env var interpolation.

Key settings:

| Setting                      | Description                               |
| ---------------------------- | ----------------------------------------- |
| `model.name`                 | Model to use (e.g. `param-max`)            |
| `tools.approvalMode`         | `plan` / `default` / `auto_edit` / `yolo` |
| `permissions.allow/ask/deny` | Tool permission rules                     |
| `mcpServers.*`               | MCP server configurations                 |

Full reference: https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/configuration/settings.md

### Authentication

Supports param OAuth (browser-based, 1000 free requests/day) and OpenAI-compatible API keys.

Full reference: https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/configuration/auth.md

### Model Providers

Configure custom model providers via `modelProviders` in settings or environment variables (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`).

Full reference: https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/configuration/model-providers.md

### Key Features

| Feature       | Description                               | Docs                                                                                                    |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Approval Mode | Control tool execution permissions        | https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/features/approval-mode.md |
| MCP           | Model Context Protocol server integration | https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/features/mcp.md           |
| Skills        | Reusable skill system via `/skill`        | https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/features/skills.md        |
| Sub-agents    | Delegate tasks to specialized agents      | https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/features/sub-agents.md    |
| Sandbox       | Secure code execution environment         | https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/features/sandbox.md       |
| Headless      | Non-interactive / CI mode                 | https://raw.githubusercontent.com/paramLM/param-code/refs/heads/main/docs/users/features/headless.md      |

## ACPX Reference

### Built-in Agent Registry

Well-known agent names resolve to commands:

- `param` → `param --acp`

### Command Syntax

```bash
# Default (prompt mode, persistent session)
acpx [global options] [prompt text...]
acpx [global options] prompt [options] [prompt text...]

# One-shot execution
acpx [global options] exec [options] [prompt text...]

# Session management
acpx [global options] cancel [-s <name>]
acpx [global options] set-mode <mode> [-s <name>]
acpx [global options] set <key> <value> [-s <name>]
acpx [global options] status [-s <name>]
acpx [global options] sessions [list | new [--name <name>] | close [name] | show [name] | history [name] [--limit <count>]]
acpx [global options] config [show | init]

# With explicit agent
acpx [global options] <agent> [options] [prompt text...]
acpx [global options] <agent> prompt [options] [prompt text...]
acpx [global options] <agent> exec [options] [prompt text...]
```

> **Note:** If prompt text is omitted and stdin is piped, `acpx` reads prompt from stdin.

### Global Options

| Option                | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `--agent <command>`   | Raw ACP agent command (fallback mechanism)                   |
| `--cwd <directory>`   | Session working directory                                    |
| `--approve-all`       | Auto-approve all requests                                    |
| `--approve-reads`     | Auto-approve reads/searches, prompt for writes (default)     |
| `--deny-all`          | Deny all requests                                            |
| `--format <format>`   | Output format: `text`, `json`, `quiet`                       |
| `--timeout <seconds>` | Maximum wait time (positive integer)                         |
| `--ttl <seconds>`     | Idle TTL for queue owners (default: `300`, `0` disables TTL) |
| `--verbose`           | Verbose ACP/debug logs to stderr                             |

Flags are mutually exclusive where applicable.
