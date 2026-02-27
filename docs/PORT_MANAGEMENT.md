# Port Management System

## Overview

AINative Website Next.js uses an intelligent port management system that **automatically** detects and resolves port conflicts. This ensures development servers always start successfully without manual intervention.

## Quick Start

### Option 1: Slash Command (Recommended for Claude Code)
```bash
/start-local
```

### Option 2: Direct Script
```bash
./scripts/start-local.sh
```

### Option 3: Manual
```bash
npm run dev
```
*(Note: This doesn't use port management and may fail if port 3000 is occupied)*

## Features

✅ **Automatic Port Conflict Detection** - Scans for processes using configured ports
✅ **Intelligent Conflict Resolution** - Kills conflicting processes automatically (configurable)
✅ **Health Checks** - Verifies services started successfully before continuing
✅ **Beautiful Terminal UI** - Color-coded output with clear status indicators
✅ **Comprehensive Logging** - All service logs saved to `/tmp/ainative-website-logs/`
✅ **Multi-Service Support** - Can manage multiple services with dependencies

## Configuration

Port management is configured in `.claude/port-config.json`:

```json
{
  "services": [
    {
      "name": "Next.js Frontend",
      "port": 3000,
      "can_reassign": false,    // MUST use port 3000
      "required": true           // Startup fails if this service fails
    }
  ],
  "conflict_resolution": {
    "mode": "kill",              // Automatically kill conflicting processes
    "ask_before_kill": false     // Don't prompt, just do it
  }
}
```

## Conflict Resolution Modes

### kill (Default - Recommended)
Automatically kills processes on conflicting ports.
```bash
./scripts/start-local.sh
```

###reassign (Multi-Instance Development)
Uses alternative ports if default is occupied.
```bash
PORT_CONFLICT_MODE=reassign ./scripts/start-local.sh
```
*(Note: Next.js cannot be reassigned per project policy)*

### ask (Interactive)
Prompts before killing each conflicting process.
```bash
PORT_CONFLICT_MODE=ask ./scripts/start-local.sh
```

### error (Strict)
Fails immediately if any port is occupied.
```bash
PORT_CONFLICT_MODE=error ./scripts/start-local.sh
```

## Examples

### Successful Startup
```
╔════════════════════════════════════════════════════════════╗
║  AINative Studio - Port Management System                 ║
╚════════════════════════════════════════════════════════════╝

📋 Configuration: port-config.json
🔧 Conflict Mode: kill

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Starting: Next.js Frontend (Priority: 1)
🔌 Port: 3000
✅ Next.js Frontend is healthy
✅ Next.js Frontend running on port 3000
🌐 Open http://localhost:3000 in your browser

╔════════════════════════════════════════════════════════════╗
║  All Services Started Successfully                         ║
╚════════════════════════════════════════════════════════════╝

✨ Ready for development!
📋 Logs: /tmp/ainative-website-logs/
```

### Port Conflict Resolution
```
⚠️  Port 3000 is occupied by: next-server (PID: 12345)
🔄 Killing process 12345 to reclaim port 3000...
✅ Port 3000 reclaimed
```

## Troubleshooting

### Port Still Shows as Occupied
```bash
# Check what's using the port
lsof -i :3000

# Manual cleanup
pkill -f "next dev"
```

### Service Won't Start
```bash
# Check the logs
tail -50 /tmp/ainative-website-logs/next.js-frontend.log

# Try with verbose output
./scripts/start-local.sh 2>&1 | tee startup.log
```

### Health Check Failing
```bash
# Verify environment variables
cat .env.local

# Test health check manually
curl http://localhost:3000
```

## Integration with Claude Code

When using Claude Code, the port management system is automatically invoked via:
- `/start-local` slash command
- Future: Pre-startup hooks (coming soon)

This ensures you NEVER have to manually manage ports again!

## Best Practices

1. **Always use `/start-local`** when working with Claude Code
2. **Check logs** in `/tmp/ainative-website-logs/` if issues occur
3. **Don't modify port 3000** - it's reserved for Next.js per project policy
4. **Use kill mode** for CI/CD and automated environments
5. **Use ask mode** when you want manual control during development

## Technical Details

### How It Works

1. **Parse Configuration** - Reads `.claude/port-config.json`
2. **Check Ports** - Uses `lsof` to detect conflicting processes
3. **Resolve Conflicts** - Based on configured mode (kill/reassign/ask/error)
4. **Start Services** - Executes start commands in priority order
5. **Health Checks** - Polls endpoints until services are responsive
6. **Report Status** - Displays summary with URLs and log locations

### Dependencies

- `jq` - JSON parsing (install with `brew install jq`)
- `lsof` - Port detection (included in macOS)
- `curl` - Health checks (included in macOS)

## Files

- `scripts/start-local.sh` - Main startup script
- `.claude/port-config.json` - Configuration
- `.claude/commands/start-local.md` - Slash command definition
- `/tmp/ainative-website-logs/` - Service logs

## Support

If port management isn't working:
1. Check that `jq` is installed: `which jq`
2. Verify config exists: `cat .claude/port-config.json`
3. Run with error output: `./scripts/start-local.sh 2>&1 | tee debug.log`
4. Check logs: `ls -la /tmp/ainative-website-logs/`

## Future Enhancements

- [ ] Pre-startup hooks in Claude Code settings
- [ ] Auto-restart on crash detection
- [ ] Port monitoring and alerting
- [ ] Support for additional services (Storybook, etc.)
- [ ] Integration with VS Code tasks
