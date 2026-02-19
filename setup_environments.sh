#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║  NASA Exoplanet Discovery Platform — One-Click Setup & Launch  ║
# ╚══════════════════════════════════════════════════════════════════╝
#
# Usage:
#   bash setup_environments.sh          # Install everything
#   bash setup_environments.sh --start  # Install + start the app
#   bash setup_environments.sh --help   # Show help
#
# Works from ANY directory. Runs on macOS and Linux.

set -euo pipefail

# ── Colors (disable if not a terminal) ──
if [ -t 1 ]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
    BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; CYAN=''; BOLD=''; NC=''
fi

info()  { echo -e "${BLUE}ℹ ${NC}$*"; }
ok()    { echo -e "${GREEN}✅ ${NC}$*"; }
warn()  { echo -e "${YELLOW}⚠️  ${NC}$*"; }
fail()  { echo -e "${RED}❌ ${NC}$*"; exit 1; }
header(){ echo ""; echo -e "${BOLD}${CYAN}── $* ──${NC}"; }

# ── Auto-detect project root ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# ── Parse flags ──
AUTO_START=false
SKIP_TRAINING=false

for arg in "$@"; do
    case "$arg" in
        --start)        AUTO_START=true ;;
        --skip-training) SKIP_TRAINING=true ;;
        --help|-h)
            echo "Usage: bash setup_environments.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --start           Install everything, then start backend + frontend"
            echo "  --skip-training   Skip the LLM training environment setup (faster)"
            echo "  --help, -h        Show this help message"
            exit 0
            ;;
        *)
            warn "Unknown flag: $arg (ignored)"
            ;;
    esac
done

echo ""
echo -e "${BOLD}🌌 NASA Exoplanet Discovery Platform — Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Validate project structure ──
if [ ! -f "$PROJECT_ROOT/README.md" ] || [ ! -d "$PROJECT_ROOT/llm-training" ] || [ ! -d "$PROJECT_ROOT/web-app" ]; then
    fail "Cannot find project structure in $PROJECT_ROOT"
fi
info "Project root: $PROJECT_ROOT"

# ── Check prerequisites ──
header "Checking prerequisites"

# Python 3
if command -v python3 &>/dev/null; then
    PY_VERSION=$(python3 --version 2>&1)
    ok "Python found: $PY_VERSION"
else
    fail "Python 3 is required but not installed.\n   macOS: brew install python3\n   Ubuntu: sudo apt install python3 python3-venv"
fi

# Ensure venv module is available
if ! python3 -m venv --help &>/dev/null; then
    fail "Python venv module not available.\n   Ubuntu: sudo apt install python3-venv"
fi

# Node / npm
if command -v node &>/dev/null && command -v npm &>/dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    NPM_VERSION=$(npm --version 2>&1)
    ok "Node.js found: $NODE_VERSION  (npm $NPM_VERSION)"
    HAS_NODE=true
else
    warn "Node.js / npm not found — frontend setup will be skipped."
    warn "Install Node.js 16+: https://nodejs.org or brew install node"
    HAS_NODE=false
fi

# ── Helper: create venv + install deps ──
setup_python_env() {
    local dir="$1"
    local req_file="$2"
    local label="$3"

    cd "$dir"

    if [ ! -d "venv" ]; then
        python3 -m venv venv
        ok "Created venv for $label"
    else
        ok "Venv already exists for $label"
    fi

    # shellcheck disable=SC1091
    source venv/bin/activate

    info "Installing $label dependencies (this may take a minute)..."
    python3 -m pip install --upgrade pip -q 2>&1 | tail -1

    if [ -f "$req_file" ]; then
        python3 -m pip install -r "$req_file" -q 2>&1 | tail -1
        ok "Installed $label dependencies from $req_file"
    else
        warn "No requirements file ($req_file) found — skipping pip install"
    fi

    deactivate 2>/dev/null || true
}

# ══════════════════════════════════════════════
# 1. LLM Training environment (optional)
# ══════════════════════════════════════════════
if [ "$SKIP_TRAINING" = false ]; then
    header "1/3  LLM Training environment"
    setup_python_env "$PROJECT_ROOT/llm-training" "requirements.txt" "LLM Training"
    mkdir -p "$PROJECT_ROOT/llm-training/data/raw" \
             "$PROJECT_ROOT/llm-training/data/processed" \
             "$PROJECT_ROOT/llm-training/outputs"
    ok "Data directories ready"
else
    header "1/3  LLM Training environment — SKIPPED (--skip-training)"
fi

# ══════════════════════════════════════════════
# 2. Backend (FastAPI + Gemini)
# ══════════════════════════════════════════════
header "2/3  Backend API (FastAPI)"
setup_python_env "$PROJECT_ROOT/web-app/llm-backend" "requirements-production.txt" "Backend"

# ══════════════════════════════════════════════
# 3. React frontend
# ══════════════════════════════════════════════
header "3/3  React Frontend"
if [ "$HAS_NODE" = true ]; then
    cd "$PROJECT_ROOT/web-app/react-frontend"
    if [ ! -d "node_modules" ]; then
        info "Installing React dependencies..."
        npm install --loglevel=error
        ok "Installed React dependencies"
    else
        ok "React dependencies already installed"
    fi
else
    warn "Skipped — install Node.js and re-run"
fi

# ══════════════════════════════════════════════
# Done
# ══════════════════════════════════════════════
cd "$PROJECT_ROOT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}🎉 Setup complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Start the app manually:"
echo ""
echo "    # Terminal 1 — Backend (port 8080)"
echo "    cd web-app/llm-backend && source venv/bin/activate && python production_server.py"
echo ""
echo "    # Terminal 2 — Frontend (port 3000)"
echo "    cd web-app/react-frontend && npm start"
echo ""
echo "  Or re-run with --start to launch automatically:"
echo "    bash setup_environments.sh --start"
echo ""

# ══════════════════════════════════════════════
# Auto-start (if --start flag was passed)
# ══════════════════════════════════════════════
if [ "$AUTO_START" = true ]; then
    header "Auto-starting the application"

    # Start backend in background
    info "Starting backend on port 8080..."
    cd "$PROJECT_ROOT/web-app/llm-backend"
    source venv/bin/activate
    python production_server.py &
    BACKEND_PID=$!
    deactivate 2>/dev/null || true

    # Wait a moment for backend to boot
    sleep 3

    # Check backend health
    if curl -s http://localhost:8080/health >/dev/null 2>&1; then
        ok "Backend is running (PID $BACKEND_PID)"
    else
        warn "Backend may still be starting up — give it a few seconds"
    fi

    # Start frontend (foreground — Ctrl+C stops both)
    info "Starting frontend on port 3000..."
    cd "$PROJECT_ROOT/web-app/react-frontend"
    export REACT_APP_API_URL=http://localhost:8080

    # Trap Ctrl+C to also kill backend
    trap 'echo ""; info "Shutting down..."; kill $BACKEND_PID 2>/dev/null; exit 0' INT TERM

    npm start

    # Cleanup when npm exits
    kill $BACKEND_PID 2>/dev/null
fi