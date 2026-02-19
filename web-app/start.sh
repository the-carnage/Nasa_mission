#!/bin/bash
# ╔═══════════════════════════════════════════════════════════╗
# ║  NASA Exoplanet Discovery — Start Backend + Frontend     ║
# ╚═══════════════════════════════════════════════════════════╝
#
# Usage:  bash start.sh           (from web-app/ or anywhere)
#         bash start.sh --backend  (backend only)
#         bash start.sh --frontend (frontend only)
#
# Ctrl+C stops everything cleanly.

set -euo pipefail

# ── Colors ──
if [ -t 1 ]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
    CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; CYAN=''; BOLD=''; NC=''
fi

info()  { echo -e "${CYAN}ℹ ${NC}$*"; }
ok()    { echo -e "${GREEN}✅${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠️ ${NC}$*"; }
fail()  { echo -e "${RED}❌${NC} $*"; exit 1; }

# ── Resolve paths (works from any directory) ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/llm-backend"
FRONTEND_DIR="$SCRIPT_DIR/react-frontend"

BACKEND_PORT="${PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# ── Parse flags ──
RUN_BACKEND=true
RUN_FRONTEND=true

for arg in "$@"; do
    case "$arg" in
        --backend)  RUN_FRONTEND=false ;;
        --frontend) RUN_BACKEND=false ;;
        --help|-h)
            echo "Usage: bash start.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --backend    Start only the FastAPI backend (port $BACKEND_PORT)"
            echo "  --frontend   Start only the React frontend (port $FRONTEND_PORT)"
            echo "  --help, -h   Show this help"
            echo ""
            echo "Default: starts both backend and frontend."
            exit 0
            ;;
        *) warn "Unknown flag: $arg (ignored)" ;;
    esac
done

echo ""
echo -e "${BOLD}🚀 NASA Exoplanet Discovery — Launcher${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Track child PIDs for cleanup ──
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    info "Shutting down..."
    [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null && info "Stopped backend  (PID $BACKEND_PID)"
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && info "Stopped frontend (PID $FRONTEND_PID)"
    # Kill any remaining child processes
    wait 2>/dev/null
    echo -e "${GREEN}${BOLD}Goodbye!${NC}"
    exit 0
}
trap cleanup INT TERM EXIT

# ══════════════════════════════════════════════
# Prerequisite checks
# ══════════════════════════════════════════════
if [ "$RUN_BACKEND" = true ]; then
    [ -d "$BACKEND_DIR" ]                || fail "Backend dir not found: $BACKEND_DIR"
    [ -f "$BACKEND_DIR/venv/bin/activate" ] || fail "Backend venv missing. Run:  bash setup_environments.sh"
    command -v python3 &>/dev/null        || fail "python3 not found"
fi

if [ "$RUN_FRONTEND" = true ]; then
    [ -d "$FRONTEND_DIR" ]               || fail "Frontend dir not found: $FRONTEND_DIR"
    command -v node &>/dev/null           || fail "Node.js not found"
    command -v npm  &>/dev/null           || fail "npm not found"
    [ -d "$FRONTEND_DIR/node_modules" ]  || {
        info "Installing frontend dependencies..."
        (cd "$FRONTEND_DIR" && npm install --loglevel=error)
    }
fi

# ══════════════════════════════════════════════
# Start Backend
# ══════════════════════════════════════════════
if [ "$RUN_BACKEND" = true ]; then
    info "Starting backend on port $BACKEND_PORT ..."
    (
        cd "$BACKEND_DIR"
        # shellcheck disable=SC1091
        source venv/bin/activate
        export PORT="$BACKEND_PORT"
        python production_server.py
    ) &
    BACKEND_PID=$!

    # Wait for backend to become healthy (up to 15s)
    info "Waiting for backend to be ready..."
    for i in $(seq 1 15); do
        if curl -s "http://localhost:${BACKEND_PORT}/health" >/dev/null 2>&1; then
            ok "Backend is ready  →  http://localhost:${BACKEND_PORT}"
            ok "API docs          →  http://localhost:${BACKEND_PORT}/docs"
            break
        fi
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            fail "Backend process exited unexpectedly. Check logs above."
        fi
        sleep 1
    done

    # Final check
    if ! curl -s "http://localhost:${BACKEND_PORT}/health" >/dev/null 2>&1; then
        warn "Backend not responding yet — it may still be loading"
    fi
fi

# ══════════════════════════════════════════════
# Start Frontend
# ══════════════════════════════════════════════
if [ "$RUN_FRONTEND" = true ]; then
    info "Starting frontend on port $FRONTEND_PORT ..."
    (
        cd "$FRONTEND_DIR"
        export REACT_APP_API_URL="http://localhost:${BACKEND_PORT}"
        export PORT="$FRONTEND_PORT"
        export BROWSER=none   # don't auto-open browser
        npm start
    ) &
    FRONTEND_PID=$!

    sleep 3
    ok "Frontend starting →  http://localhost:${FRONTEND_PORT}"
fi

# ══════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}  Services running:${NC}"
[ "$RUN_BACKEND"  = true ] && echo "    Backend  → http://localhost:${BACKEND_PORT}  (PID $BACKEND_PID)"
[ "$RUN_FRONTEND" = true ] && echo "    Frontend → http://localhost:${FRONTEND_PORT}  (PID $FRONTEND_PID)"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Keep script alive until a child exits or user presses Ctrl+C
wait
