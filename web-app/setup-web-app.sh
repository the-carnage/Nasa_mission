#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  NASA Exoplanet Discovery — Web App Setup (Backend + UI)   ║
# ╚══════════════════════════════════════════════════════════════╝
#
# Usage:  bash setup-web-app.sh           (setup only)
#         bash setup-web-app.sh --start   (setup + launch)
#         bash setup-web-app.sh --help

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

# ── Paths (relative to this script) ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/llm-backend"
FRONTEND_DIR="$SCRIPT_DIR/react-frontend"

# ── Flags ──
AUTO_START=false
for arg in "$@"; do
    case "$arg" in
        --start)   AUTO_START=true ;;
        --help|-h)
            echo "Usage: bash setup-web-app.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --start    Setup then immediately start the app"
            echo "  --help     Show this help"
            exit 0
            ;;
        *) warn "Unknown flag: $arg (ignored)" ;;
    esac
done

echo ""
echo -e "${BOLD}🌌 NASA Exoplanet — Web App Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ══════════════════════════════════════
# Check prerequisites
# ══════════════════════════════════════
info "Checking prerequisites..."

command -v python3 &>/dev/null || fail "Python 3 not found.\n  macOS:  brew install python3\n  Ubuntu: sudo apt install python3 python3-venv"
python3 -m venv --help &>/dev/null || fail "Python venv missing.\n  Ubuntu: sudo apt install python3-venv"
ok "Python: $(python3 --version)"

if command -v node &>/dev/null && command -v npm &>/dev/null; then
    ok "Node.js: $(node --version)  (npm $(npm --version))"
    HAS_NODE=true
else
    warn "Node.js / npm not found — frontend setup will be skipped."
    warn "Install: https://nodejs.org  or  brew install node"
    HAS_NODE=false
fi

# ══════════════════════════════════════
# 1. Backend (FastAPI)
# ══════════════════════════════════════
echo ""
echo -e "${BOLD}1/2  Backend (FastAPI)${NC}"
[ -d "$BACKEND_DIR" ] || fail "Backend dir not found: $BACKEND_DIR"
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    ok "Created backend venv"
else
    ok "Backend venv already exists"
fi

# shellcheck disable=SC1091
source venv/bin/activate
info "Upgrading pip..."
python3 -m pip install --upgrade pip -q

if [ -f "requirements-production.txt" ]; then
    REQ="requirements-production.txt"
elif [ -f "requirements.txt" ]; then
    REQ="requirements.txt"
else
    warn "No requirements file found — skipping pip install"
    REQ=""
fi

if [ -n "$REQ" ]; then
    info "Installing backend dependencies from $REQ ..."
    python3 -m pip install -r "$REQ" -q
    ok "Backend dependencies installed"
fi

deactivate 2>/dev/null || true

# ══════════════════════════════════════
# 2. Frontend (React)
# ══════════════════════════════════════
echo ""
echo -e "${BOLD}2/2  Frontend (React)${NC}"

if [ "$HAS_NODE" = true ]; then
    [ -d "$FRONTEND_DIR" ] || fail "Frontend dir not found: $FRONTEND_DIR"
    cd "$FRONTEND_DIR"

    if [ ! -d "node_modules" ]; then
        info "Installing React dependencies (this may take a minute)..."
        npm install --loglevel=error
        ok "Frontend dependencies installed"
    else
        ok "Frontend dependencies already installed"
    fi
else
    warn "Skipped — install Node.js and re-run"
fi

# ══════════════════════════════════════
# Done
# ══════════════════════════════════════
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}🎉 Web app setup complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  To start the app:"
echo ""
echo "    bash $SCRIPT_DIR/start.sh"
echo ""
echo "  Or start services individually:"
echo "    Backend  → cd llm-backend && source venv/bin/activate && python production_server.py"
echo "    Frontend → cd react-frontend && npm start"
echo ""

# ══════════════════════════════════════
# Auto-start (--start flag)
# ══════════════════════════════════════
if [ "$AUTO_START" = true ]; then
    info "Launching app via start.sh ..."
    bash "$SCRIPT_DIR/start.sh"
fi
