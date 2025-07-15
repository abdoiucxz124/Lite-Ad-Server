# 🤖 OpenAI Codex Setup Guide for Lite Ad Server

This guide will help you set up and use OpenAI Codex CLI with your lite ad server project for AI-powered development assistance.

---

## 📋 Prerequisites

Before setting up Codex, ensure you have:

- **Node.js 20+** installed
- **Git** configured for your project
- **OpenAI API Key** or **OpenAI Plus/Pro subscription**
- **Project cloned** and dependencies installed

---

## 🚀 Quick Setup

### 1. Install OpenAI Codex CLI

Choose your preferred installation method:

```bash
# Option 1: Using npm (recommended)
npm install -g @openai/codex

# Option 2: Using brew (macOS)
brew install codex

# Option 3: Using project script
npm run codex:install
```

### 2. Authentication Setup

**For OpenAI API Users:**
```bash
export OPENAI_API_KEY="your-api-key-here"
```

**For OpenAI Plus/Pro Users:**
```bash
codex login
```

### 3. Verify Installation

```bash
# Check Codex version
codex --version

# Test with project
cd your-lite-ad-server-project
codex "explain this project structure"
```

---

## ⚙️ Configuration

Your project includes a pre-configured `.codex-config.toml` file with optimal settings:

### 🎯 Available Profiles

| Profile | Use Case | Approval Policy | Sandbox Mode |
|---------|----------|----------------|--------------|
| `dev` | Development with oversight | `untrusted` | `workspace-write` |
| `auto` | Full automation | `on-failure` | `workspace-write` |
| `explore` | Safe exploration | `never` | `read-only` |
| `test` | Testing changes | `always` | `read-only` |

### 🛠 Using Profiles

```bash
# Development mode (default)
npm run codex:dev
# or: codex --profile dev

# Full automation mode
npm run codex:auto
# or: codex --profile auto

# Safe exploration mode
npm run codex:explore
# or: codex --profile explore

# Testing mode
npm run codex:test
# or: codex --profile test
```

---

## 🎮 Usage Examples

### **Interactive Development**

```bash
# Start Codex for interactive development
codex
# or
npm run codex:dev
```

### **Specific Tasks**

```bash
# Feature development
codex "Add JWT authentication to the admin dashboard"

# Bug fixing
codex "Fix the rate limiting issue in track.js"

# Code improvement
codex "Optimize the SQLite database queries for better performance"

# Testing
codex "Write comprehensive tests for the ad serving endpoints"

# Documentation
codex "Update the API documentation with new endpoints"
```

### **Full Automation Mode**

```bash
# Let Codex work autonomously with minimal intervention
codex --full-auto "Implement real-time analytics with WebSockets"

# Using project profile
npm run codex:auto
```

---

## 📁 Project-Specific Features

### **AGENTS.md Integration**

Your project includes a comprehensive `AGENTS.md` file that guides Codex with:

- ✅ **Project structure** and file organization
- ✅ **Coding conventions** and best practices
- ✅ **Quality requirements** (ESLint, tests, Docker)
- ✅ **Security guidelines** and patterns
- ✅ **Database operations** and SQLite best practices
- ✅ **API design principles** and patterns

### **Pre-configured Quality Checks**

Codex will automatically run these checks:

```bash
# Linting (zero warnings required)
npm run lint

# Testing (all tests must pass)
npm test

# Full quality check
npm run check:full
```

### **Docker Integration**

Codex understands your Docker setup:

```bash
codex "Build and test the Docker container"
codex "Optimize the Dockerfile for smaller image size"
codex "Debug the docker-compose configuration"
```

---

## 🔧 Advanced Configuration

### **Custom Model Settings**

Edit `.codex-config.toml` to customize:

```toml
# Use different models
model = "o3"          # For complex reasoning
model = "o4-mini"     # For quick tasks

# Adjust creativity
temperature = 0.1     # More deterministic
temperature = 0.3     # More creative

# Change approval policy
approval_policy = "never"      # Full automation
approval_policy = "always"     # Maximum control
```

### **Environment-Specific Settings**

The configuration automatically adjusts based on `NODE_ENV`:

- **Development**: More permissive, detailed logging
- **Production**: Stricter controls, minimal logging
- **Test**: Safe mode, no modifications

### **MCP Server Integration**

Uncomment and configure MCP servers in `.codex-config.toml`:

```toml
[mcp_servers.sqlite]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-sqlite", "data/ads.db"]

[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
env = { GITHUB_PERSONAL_ACCESS_TOKEN = "your-token" }
```

---

## 💡 Best Practices

### **Effective Prompts**

```bash
# ✅ Good: Specific and actionable
codex "Add input validation to the /api/ad endpoint using express-validator"

# ❌ Poor: Vague and unclear
codex "make it better"

# ✅ Good: Context-aware
codex "Following the existing pattern in track.js, add a new endpoint for bulk impression tracking"

# ✅ Good: With constraints
codex "Implement caching for ad responses, ensuring it doesn't break existing tests"
```

### **Security Considerations**

- **Review changes** before approval in sensitive areas
- **Use read-only mode** for exploration
- **Enable sandbox** for untrusted operations
- **Set approval policy** appropriately for your workflow

### **Workflow Tips**

1. **Start with exploration**: `npm run codex:explore`
2. **Move to development**: `npm run codex:dev`  
3. **Use automation carefully**: `npm run codex:auto`
4. **Always run quality checks**: `npm run check:full`

---

## 🐛 Troubleshooting

### **Common Issues**

**Authentication Problems:**
```bash
# Clear authentication
rm ~/.codex/auth.json
codex login
```

**Configuration Issues:**
```bash
# Validate configuration
codex --config-check

# Use default configuration
codex --config approval_policy=untrusted
```

**Permission Errors:**
```bash
# Check sandbox settings
codex --sandbox read-only

# Bypass sandbox (use carefully)
codex --dangerously-bypass-approvals-and-sandbox
```

### **Performance Optimization**

```bash
# Use faster models for simple tasks
codex --model o4-mini "fix typos in README"

# Use more powerful models for complex tasks
codex --model o3 "refactor the entire analytics system"
```

### **Debugging**

```bash
# Enable verbose logging
RUST_LOG=debug codex

# Monitor logs
tail -F ~/.codex/log/codex-tui.log
```

---

## 📚 Resources

### **Documentation**
- [Official Codex CLI Docs](https://github.com/openai/codex)
- [Configuration Reference](https://github.com/openai/codex/blob/main/codex-rs/config.md)
- [Project AGENTS.md](./AGENTS.md)

### **Community**
- [GitHub Issues](https://github.com/openai/codex/issues)
- [GitHub Discussions](https://github.com/openai/codex/discussions)

### **Support**
- **Security Issues**: security@openai.com
- **General Support**: [GitHub Issues](https://github.com/openai/codex/issues)

---

## 🎉 You're Ready!

Your lite ad server project is now fully configured for OpenAI Codex. Start with:

```bash
cd your-lite-ad-server-project
npm run codex:dev
```

Then try: **"Help me implement the next feature from NEXT_FEATURES.md"**

Happy coding with your AI pair programmer! 🚀 