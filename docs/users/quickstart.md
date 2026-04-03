# Quickstart

> 👏 Welcome to param Code!

This quickstart guide will have you using AI-powered coding assistance in just a few minutes. By the end, you'll understand how to use param Code for common development tasks.

## Before you begin

Make sure you have:

- A **terminal** or command prompt open
- A code project to work with
- A [param Code](https://chat.param.ai/auth?mode=register) account

## Step 1: Install param Code

To install param Code, use one of the following methods:

### Quick Install (Recommended)

**Linux / macOS**

```sh
curl -fsSL https://param-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-param.sh | bash
```

**Windows (Run as Administrator CMD)**

```sh
curl -fsSL -o %TEMP%\install-param.bat https://param-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-param.bat && %TEMP%\install-param.bat
```

> [!note]
>
> It's recommended to restart your terminal after installation to ensure environment variables take effect.

### Manual Installation

**Prerequisites**

Make sure you have Node.js 20 or later installed. Download it from [nodejs.org](https://nodejs.org/en/download).

**NPM**

```bash
npm install -g @param-code/param-code@latest
```

**Homebrew (macOS, Linux)**

```bash
brew install param-code
```

## Step 2: Log in to your account

param Code requires an account to use. When you start an interactive session with the `param` command, you'll be prompted to log in:

```bash
# You'll be prompted to log in on first use
param
```

```bash
# Follow the prompts to log in with your account
/auth
```

Select `param OAuth`, log in to your account and follow the prompts to confirm. Once logged in, your credentials are stored and you won't need to log in again.

> [!note]
>
> When you first authenticate param Code with your param account, a workspace called ".param" is automatically created for you. This workspace provides centralized cost tracking and management for all param Code usage in your organization.

> [!tip]
>
> You can also configure authentication directly from the terminal without starting a session by running `param auth`. Use `param auth status` to check your current configuration at any time. See the [Authentication](./configuration/auth) page for details.

## Step 3: Start your first session

Open your terminal in any project directory and start param Code:

```bash
# optiona
cd /path/to/your/project
# start param
param
```

You'll see the param Code welcome screen with your session information, recent conversations, and latest updates. Type `/help` for available commands.

## Chat with param Code

### Ask your first question

param Code will analyze your files and provide a summary. You can also ask more specific questions:

```
explain the folder structure
```

You can also ask param Code about its own capabilities:

```
what can param Code do?
```

> [!note]
>
> param Code reads your files as needed - you don't have to manually add context. param Code also has access to its own documentation and can answer questions about its features and capabilities.

### Make your first code change

Now let's make param Code do some actual coding. Try a simple task:

```
add a hello world function to the main file
```

param Code will:

1. Find the appropriate file
2. Show you the proposed changes
3. Ask for your approval
4. Make the edit

> [!note]
>
> param Code always asks for permission before modifying files. You can approve individual changes or enable "Accept all" mode for a session.

### Use Git with param Code

param Code makes Git operations conversational:

```
what files have I changed?
```

```
commit my changes with a descriptive message
```

You can also prompt for more complex Git operations:

```
create a new branch called feature/quickstart
```

```
show me the last 5 commits
```

```
help me resolve merge conflicts
```

### Fix a bug or add a feature

param Code is proficient at debugging and feature implementation.

Describe what you want in natural language:

```
add input validation to the user registration form
```

Or fix existing issues:

```
there's a bug where users can submit empty forms - fix it
```

param Code will:

- Locate the relevant code
- Understand the context
- Implement a solution
- Run tests if available

### Test out other common workflows

There are a number of ways to work with param Code:

**Refactor code**

```
refactor the authentication module to use async/await instead of callbacks
```

**Write tests**

```
write unit tests for the calculator functions
```

**Update documentation**

```
update the README with installation instructions
```

**Code review**

```
review my changes and suggest improvements
```

> [!tip]
>
> **Remember**: param Code is your AI pair programmer. Talk to it like you would a helpful colleague - describe what you want to achieve, and it will help you get there.

## Essential commands

Here are the most important commands for daily use:

| Command               | What it does                                     | Example                       |
| --------------------- | ------------------------------------------------ | ----------------------------- |
| `param`                | start param Code                                  | `param`                        |
| `/auth`               | Change authentication method (in session)        | `/auth`                       |
| `param auth`           | Configure authentication from the terminal       | `param auth`                   |
| `param auth status`    | Check current authentication status              | `param auth status`            |
| `/help`               | Display help information for available commands  | `/help` or `/?`               |
| `/compress`           | Replace chat history with summary to save Tokens | `/compress`                   |
| `/clear`              | Clear terminal screen content                    | `/clear` (shortcut: `Ctrl+L`) |
| `/theme`              | Change param Code visual theme                    | `/theme`                      |
| `/language`           | View or change language settings                 | `/language`                   |
| → `ui [language]`     | Set UI interface language                        | `/language ui zh-CN`          |
| → `output [language]` | Set LLM output language                          | `/language output Chinese`    |
| `/quit`               | Exit param Code immediately                       | `/quit` or `/exit`            |

See the [CLI reference](./features/commands) for a complete list of commands.

## Pro tips for beginners

**Be specific with your requests**

- Instead of: "fix the bug"
- Try: "fix the login bug where users see a blank screen after entering wrong credentials"

**Use step-by-step instructions**

- Break complex tasks into steps:

```
1. create a new database table for user profiles
2. create an API endpoint to get and update user profiles
3. build a webpage that allows users to see and edit their information
```

**Let param Code explore first**

- Before making changes, let param Code understand your code:

```
analyze the database schema
```

```
build a dashboard showing products that are most frequently returned by our UK customers
```

**Save time with shortcuts**

- Press `?` to see all available keyboard shortcuts
- Use Tab for command completion
- Press ↑ for command history
- Type `/` to see all slash commands

## Getting help

- **In param Code**: Type `/help` or ask "how do I..."
- **Documentation**: You're here! Browse other guides
- **Community**: Join our [GitHub Discussion](https://github.com/paramLM/param-code/discussions) for tips and support
