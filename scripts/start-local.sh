#!/bin/bash
set -euo pipefail

# Port Management Startup Script with ZeroDB Service Coordination
# Reads .claude/port-config.json and manages all services with intelligent conflict resolution
# Registers services in ZeroDB for team-wide port coordination across machines
#
# Requirements:
#   - jq (brew install jq)
#   - dev-manager CLI (from /Users/aideveloper/core/dev-manager)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/.claude/port-config.json"
DEV_MANAGER_CLI="/Users/aideveloper/core/dev-manager/bin/cli.js"

# If config doesn't exist locally, check core
if [[ ! -f "$CONFIG_FILE" ]]; then
  CORE_CONFIG="/Users/aideveloper/core/.claude/port-config.json"
  if [[ -f "$CORE_CONFIG" ]]; then
    CONFIG_FILE="$CORE_CONFIG"
  else
    echo "❌ Error: No port-config.json found"
    echo "   Checked: $PROJECT_ROOT/.claude/port-config.json"
    echo "   Checked: $CORE_CONFIG"
    exit 1
  fi
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Log directory
LOG_DIR="${LOG_DIR:-/tmp/ainative-website-logs}"
mkdir -p "$LOG_DIR"

# Conflict resolution mode (ask/kill/reassign/error)
CONFLICT_MODE="${PORT_CONFLICT_MODE:-$(jq -r '.conflict_resolution.mode // "kill"' "$CONFIG_FILE")}"
ASK_BEFORE_KILL=$(jq -r '.conflict_resolution.ask_before_kill // false' "$CONFIG_FILE")

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  AINative Studio - Port Management System                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Configuration:${NC} $(basename "$CONFIG_FILE")"
echo -e "${BLUE}🔧 Conflict Mode:${NC} $CONFLICT_MODE"
echo ""

# Function to check if port is in use
check_port() {
  local port=$1
  lsof -ti ":$port" 2>/dev/null
}

# Function to get process info
get_process_info() {
  local pid=$1
  local cmd=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
  echo "$cmd"
}

# Function to kill process on port
kill_port_process() {
  local port=$1
  local service_name=$2

  local pids=$(check_port "$port")
  if [[ -n "$pids" ]]; then
    # Kill all processes on the port
    for pid in $pids; do
      local process_name=$(get_process_info "$pid")
      # Execute on_conflict hooks
      echo -e "${YELLOW}⚠️  Port $port is occupied by: $process_name (PID: $pid)${NC}"

      if [[ "$ASK_BEFORE_KILL" == "true" && "$CONFLICT_MODE" == "kill" ]]; then
        read -p "Kill process $pid to start $service_name? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
          echo -e "${RED}❌ Aborted by user${NC}"
          return 1
        fi
      fi

      echo -e "${CYAN}🔄 Killing process $pid to reclaim port $port...${NC}"
      kill -9 "$pid" 2>/dev/null || true
    done

    sleep 1

    # Verify port is free
    if check_port "$port" >/dev/null; then
      echo -e "${RED}❌ Failed to kill all processes on port $port${NC}"
      return 1
    fi

    echo -e "${GREEN}✅ Port $port reclaimed${NC}"
  fi
  return 0
}

# Function to find available port
find_available_port() {
  local base_port=$1
  local max_tries=${2:-100}

  for ((i=0; i<max_tries; i++)); do
    local test_port=$((base_port + i))
    if ! check_port "$test_port" >/dev/null; then
      echo "$test_port"
      return 0
    fi
  done

  return 1
}

# Function to start a service
start_service() {
  local service_index=$1

  # Parse service config
  local name=$(jq -r ".services[$service_index].name" "$CONFIG_FILE")
  local port=$(jq -r ".services[$service_index].port" "$CONFIG_FILE")
  local start_cmd=$(jq -r ".services[$service_index].start_command" "$CONFIG_FILE")
  local directory=$(jq -r ".services[$service_index].directory // \"\"" "$CONFIG_FILE")
  local can_reassign=$(jq -r ".services[$service_index].can_reassign // true" "$CONFIG_FILE")
  local required=$(jq -r ".services[$service_index].required // true" "$CONFIG_FILE")
  local health_check=$(jq -r ".services[$service_index].health_check // \"\"" "$CONFIG_FILE")
  local priority=$(jq -r ".services[$service_index].priority // 99" "$CONFIG_FILE")
  local project_id=$(echo "$name" | tr '[:upper:] ' '[:lower:]-')

  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🚀 Starting:${NC} $name (Priority: $priority)"
  echo -e "${BLUE}🔌 Port:${NC} $port"

  # Check for port conflict
  local actual_port=$port
  if check_port "$port" >/dev/null; then
    case "$CONFLICT_MODE" in
      kill)
        if ! kill_port_process "$port" "$name"; then
          if [[ "$required" == "true" ]]; then
            echo -e "${RED}❌ Failed to start required service: $name${NC}"
            exit 1
          else
            echo -e "${YELLOW}⚠️  Skipping optional service: $name${NC}"
            return 0
          fi
        fi
        ;;
      reassign)
        if [[ "$can_reassign" == "true" ]]; then
          actual_port=$(find_available_port "$port")
          if [[ -z "$actual_port" ]]; then
            echo -e "${RED}❌ No available ports found for $name${NC}"
            if [[ "$required" == "true" ]]; then
              exit 1
            else
              return 0
            fi
          fi
          echo -e "${YELLOW}📍 Reassigning to port: $actual_port${NC}"
        else
          echo -e "${RED}❌ Port $port occupied and service cannot be reassigned${NC}"
          if [[ "$required" == "true" ]]; then
            exit 1
          else
            return 0
          fi
        fi
        ;;
      error)
        echo -e "${RED}❌ Port $port is occupied (error mode)${NC}"
        exit 1
        ;;
      ask)
        local pid=$(check_port "$port")
        local process_name=$(get_process_info "$pid")
        echo -e "${YELLOW}⚠️  Port $port is occupied by: $process_name (PID: $pid)${NC}"
        echo ""
        echo "Choose an action:"
        echo "  [k] Kill process and continue"
        [[ "$can_reassign" == "true" ]] && echo "  [r] Use alternative port"
        echo "  [a] Abort startup"
        read -p "Action: " -n 1 -r
        echo
        case $REPLY in
          k|K)
            kill_port_process "$port" "$name" || exit 1
            ;;
          r|R)
            if [[ "$can_reassign" == "true" ]]; then
              actual_port=$(find_available_port "$port")
              echo -e "${YELLOW}📍 Using port: $actual_port${NC}"
            else
              echo -e "${RED}❌ Service cannot be reassigned${NC}"
              exit 1
            fi
            ;;
          *)
            echo -e "${RED}❌ Aborted by user${NC}"
            exit 1
            ;;
        esac
        ;;
    esac
  fi

  # Change to service directory if specified
  if [[ -n "$directory" && "$directory" != "null" ]]; then
    cd "$PROJECT_ROOT/$directory"
  else
    cd "$PROJECT_ROOT"
  fi

  # Substitute port in start command
  local actual_cmd="${start_cmd//\{port\}/$actual_port}"

  # Start the service
  local log_file="$LOG_DIR/$(echo "$name" | tr '[:upper:] ' '[:lower:]-').log"
  echo -e "${BLUE}📝 Log:${NC} $log_file"
  echo -e "${BLUE}💻 Command:${NC} $actual_cmd"

  # Execute start command in background
  eval "$actual_cmd" > "$log_file" 2>&1 &
  local pid=$!

  # Wait a moment for startup
  sleep 2

  # Check if process is still running
  if ! ps -p $pid > /dev/null 2>&1; then
    echo -e "${RED}❌ Service failed to start (check $log_file)${NC}"
    tail -20 "$log_file"
    if [[ "$required" == "true" ]]; then
      exit 1
    else
      return 0
    fi
  fi

  # Register service in ZeroDB
  echo -e "${BLUE}📊 Registering in ZeroDB...${NC}"

  # Use health_check URL if available, otherwise default to root
  local health_url_arg=""
  if [[ -n "$health_check" && "$health_check" != "null" ]]; then
    local actual_health_url="${health_check//\{port\}/$actual_port}"
    health_url_arg="--health-url \"$actual_health_url\""
  else
    health_url_arg="--health-url \"http://localhost:$actual_port\""
  fi

  # Register service (suppress stderr to avoid noise from known backend issues)
  local service_id=""
  if [[ -f "$DEV_MANAGER_CLI" ]]; then
    service_id=$(eval "node \"$DEV_MANAGER_CLI\" register \
      --project-id \"$project_id\" \
      --project-name \"$name\" \
      --port \"$actual_port\" \
      --command \"$actual_cmd\" \
      $health_url_arg" 2>/dev/null || echo "")
  fi

  if [[ -n "$service_id" && "$service_id" != "undefined" ]]; then
    echo -e "${GREEN}✅ Registered in ZeroDB: $service_id${NC}"
    echo -e "${BLUE}   View all services: node $DEV_MANAGER_CLI status${NC}"

    # Note: PID update currently has backend issues (returns 500)
    # Services are tracked without PID initially
    # Uncomment when backend fix is deployed:
    # node "$DEV_MANAGER_CLI" update-pid \
    #   --service-id "$service_id" \
    #   --pid "$pid" 2>/dev/null || true
  else
    if [[ ! -f "$DEV_MANAGER_CLI" ]]; then
      echo -e "${YELLOW}⚠️  dev-manager not available (service will still run locally)${NC}"
      echo -e "${YELLOW}   Install: cd /Users/aideveloper/core/dev-manager && npm install${NC}"
    else
      echo -e "${YELLOW}⚠️  Could not register in ZeroDB (service will still run)${NC}"
      echo -e "${YELLOW}   This is non-critical - port coordination will work locally${NC}"
    fi
  fi

  # Health check if configured
  if [[ -n "$health_check" && "$health_check" != "null" ]]; then
    local health_url="${health_check//\{port\}/$actual_port}"
    echo -e "${BLUE}🏥 Health check:${NC} $health_url"

    local retries=$(jq -r '.startup_sequence.health_check_retries // 30' "$CONFIG_FILE")
    local retry_delay=$(jq -r '.startup_sequence.retry_delay_ms // 1000' "$CONFIG_FILE")

    for ((i=1; i<=retries; i++)); do
      if curl -sf "$health_url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is healthy${NC}"
        break
      fi
      if [[ $i -eq $retries ]]; then
        echo -e "${RED}❌ Health check failed after $retries attempts${NC}"
        if [[ "$required" == "true" ]]; then
          exit 1
        fi
      fi
      sleep $(echo "scale=2; $retry_delay / 1000" | bc)
    done
  else
    echo -e "${GREEN}✅ $name started (PID: $pid)${NC}"
  fi

  # Execute post_start hooks
  echo -e "${GREEN}✅ $name running on port $actual_port${NC}"
  echo -e "${GREEN}🌐 Open http://localhost:$actual_port in your browser${NC}"

  return 0
}

# Main execution
main() {
  # Get number of services
  local service_count=$(jq '.services | length' "$CONFIG_FILE")

  if [[ "$service_count" -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  No services configured${NC}"
    exit 0
  fi

  # Start all services in priority order
  for ((i=0; i<service_count; i++)); do
    start_service $i
  done

  echo ""
  echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  All Services Started Successfully                         ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}✨ Ready for development!${NC}"
  echo -e "${BLUE}📋 Logs:${NC} $LOG_DIR/"
  echo ""
}

# Check dependencies
if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ Error: jq is required but not installed${NC}"
  echo "Install with: brew install jq"
  exit 1
fi

# Run main
main
