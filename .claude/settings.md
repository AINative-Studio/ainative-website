# Project-Specific Claude Settings

## Port Management

**Assigned Port: 3000**

This project (ainative-nextjs) is registered in `~/.claude/port-registry.json` as:
- **Port**: 3000
- **Command**: `npm run dev`

### Rules for Claude Models

1. **NEVER kill processes on ports without user permission**
2. **ALWAYS check port availability before starting dev server**:
   ```bash
   lsof -i :3000 2>/dev/null | grep LISTEN
   ```
3. **If port 3000 is in use**, report the conflict and ask user how to proceed
4. **Do NOT start background dev servers** unless explicitly requested
5. When running dev server, use: `npm run dev` (defaults to port 3000)

### Other Project Ports (Do Not Use)

| Port | Project |
|------|---------|
| 3001 | karstenwade.com (Next.js) |
| 5177 | ainative-website-vite (legacy) |
| 1337 | karstenwade-strapi (CMS) |

### Port Conflict Resolution

If you encounter a port conflict:
1. First check what's using the port: `lsof -i :3000`
2. Report to user: "Port 3000 is in use by [process]. Options: 1) Stop that process 2) Use alternate port 3) Skip server start"
3. Wait for user decision - never auto-kill

## Git Commit Rules

**CRITICAL**: ZERO TOLERANCE for Claude/Anthropic attribution in commits or PRs.

- NO "Generated with Claude Code" footers
- NO "Co-Authored-By: Claude" signatures
- NO references to Claude or Anthropic in commit messages
- Commits should appear as if written by the developer

## Development Server

- Default command: `npm run dev`
- Port: 3000
- For production preview: `npm run build && npm run start`
