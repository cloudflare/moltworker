#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# State file for tracking progress
STATE_FILE=".install_state"

# Environment file for non-interactive secrets
ENV_FILE=""

# Define installation steps (order matters)
STEPS=(
    "check_prerequisites"
    "install_dependencies"
    "setup_dev_vars"
    "generate_types"
    "run_typecheck"
    "setup_secrets"
)

STEP_DESCRIPTIONS=(
    "Checking prerequisites"
    "Installing dependencies"
    "Setting up dev vars"
    "Generating types"
    "Running type check"
    "Setting up secrets"
)

# Logging functions
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Load environment variables from a file
load_env_file() {
    local file="$1"

    if [ ! -f "$file" ]; then
        error "Environment file not found: $file"
        return 1
    fi

    info "Loading environment from: $file"

    # Parse .env file, handling comments and empty lines
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

        # Remove leading/trailing whitespace
        line="${line#"${line%%[![:space:]]*}"}"
        line="${line%"${line##*[![:space:]]}"}"

        # Skip if not a valid assignment
        [[ ! "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] && continue

        # Extract key and value
        local key="${line%%=*}"
        local value="${line#*=}"

        # Remove surrounding quotes from value
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"

        # Export the variable
        export "$key=$value"
    done < "$file"

    success "Environment loaded"
    return 0
}

# Get value from environment or prompt user
get_env_or_prompt() {
    local var_name="$1"
    local prompt_text="$2"
    local is_secret="${3:-false}"
    local is_required="${4:-true}"

    # Check if variable is already set in environment
    local current_value="${!var_name:-}"

    if [ -n "$current_value" ]; then
        if [ "$is_secret" = "true" ]; then
            success "$var_name loaded from environment (***hidden***)"
        else
            success "$var_name loaded from environment: $current_value"
        fi
        echo "$current_value"
        return 0
    fi

    # If we have an env file but the value wasn't found, and it's required
    if [ -n "$ENV_FILE" ] && [ "$is_required" = "true" ]; then
        warn "$var_name not found in $ENV_FILE"
    fi

    # Prompt user
    echo "$prompt_text" >&2
    if [ "$is_secret" = "true" ]; then
        read -r -s value
        echo "" >&2
    else
        read -r value
    fi

    echo "$value"
}

# State management functions
save_state() {
    local step="$1"
    echo "$step" > "$STATE_FILE"
}

get_saved_state() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo ""
    fi
}

clear_state() {
    rm -f "$STATE_FILE"
}

get_step_index() {
    local step="$1"
    for i in "${!STEPS[@]}"; do
        if [ "${STEPS[$i]}" = "$step" ]; then
            echo "$i"
            return
        fi
    done
    echo "-1"
}

# Check if we should resume from a previous run
check_resume() {
    local saved_step
    saved_step=$(get_saved_state)

    if [ -n "$saved_step" ]; then
        local step_idx
        step_idx=$(get_step_index "$saved_step")

        if [ "$step_idx" -ge 0 ]; then
            echo ""
            warn "Previous installation was interrupted at step: ${STEP_DESCRIPTIONS[$step_idx]}"
            echo -e "${YELLOW}Would you like to resume from where you left off? (y/n)${NC}"
            read -r response

            if [[ "$response" =~ ^[Yy]$ ]]; then
                echo "$step_idx"
                return
            else
                echo -e "${YELLOW}Start fresh installation? (y/n)${NC}"
                read -r fresh
                if [[ "$fresh" =~ ^[Yy]$ ]]; then
                    clear_state
                    echo "0"
                    return
                else
                    info "Installation cancelled"
                    exit 0
                fi
            fi
        fi
    fi

    echo "0"
}

# Header
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}       MoltWorker Installation Script           ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Detect package manager preference
detect_package_manager() {
    if command -v bun &> /dev/null; then
        echo "bun"
    elif command -v npm &> /dev/null; then
        echo "npm"
    else
        echo "none"
    fi
}

PKG_MANAGER=$(detect_package_manager)

# Check prerequisites
check_prerequisites() {
    info "Checking prerequisites..."
    local missing=()

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
        if [ "$NODE_VERSION" -ge 22 ]; then
            success "Node.js $(node -v) installed"
        else
            warn "Node.js $(node -v) found, but v22+ is recommended"
        fi
    else
        missing+=("Node.js 22+")
    fi

    # Check package manager
    if [ "$PKG_MANAGER" = "bun" ]; then
        success "Bun $(bun -v) installed"
    elif [ "$PKG_MANAGER" = "npm" ]; then
        success "npm $(npm -v) installed"
    else
        missing+=("npm or bun")
    fi

    # Check Docker (optional but recommended)
    if command -v docker &> /dev/null; then
        success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') installed"
    else
        warn "Docker not found (optional, needed for custom container builds)"
    fi

    # Check Git
    if command -v git &> /dev/null; then
        success "Git $(git --version | cut -d' ' -f3) installed"
    else
        missing+=("Git")
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        error "Missing required dependencies:"
        for dep in "${missing[@]}"; do
            echo "  - $dep"
        done
        return 1
    fi

    return 0
}

# Install dependencies
install_dependencies() {
    info "Installing dependencies..."

    if [ "$PKG_MANAGER" = "bun" ]; then
        if ! bun install; then
            error "Failed to install dependencies with bun"
            return 1
        fi
    else
        if ! npm install; then
            error "Failed to install dependencies with npm"
            return 1
        fi
    fi

    success "Dependencies installed"
    return 0
}

# Generate types
generate_types() {
    info "Generating Cloudflare types..."

    if [ "$PKG_MANAGER" = "bun" ]; then
        bun run types 2>/dev/null || warn "Type generation skipped (wrangler not configured)"
    else
        npm run types 2>/dev/null || warn "Type generation skipped (wrangler not configured)"
    fi

    return 0
}

# Setup development environment
setup_dev_vars() {
    if [ ! -f ".dev.vars" ]; then
        if [ -f ".dev.vars.example" ]; then
            info "Creating .dev.vars from example..."
            if ! cp .dev.vars.example .dev.vars; then
                error "Failed to create .dev.vars"
                return 1
            fi
            success "Created .dev.vars - please edit with your values"
        else
            info "Creating basic .dev.vars file..."
            if ! cat > .dev.vars << 'EOF'
# Development environment variables
# Copy this to .dev.vars and fill in your values

# Required: Cloudflare AI Gateway configuration
CF_AI_GATEWAY_ACCOUNT_ID=
CF_AI_GATEWAY_GATEWAY_ID=
CLOUDFLARE_AI_GATEWAY_API_KEY=
# CF_AI_GATEWAY_MODEL=  # Optional: override model

# Required: Gateway token (generate with: openssl rand -hex 32)
MOLTBOT_GATEWAY_TOKEN=

# Enable development mode (bypasses some auth checks)
DEV_MODE=true

# Optional: Cloudflare Access (for admin UI in production)
# CF_ACCESS_TEAM_DOMAIN=myteam.cloudflareaccess.com
# CF_ACCESS_AUD=your-application-audience-uuid

# Optional: R2 persistent storage
# R2_ACCESS_KEY_ID=
# R2_SECRET_ACCESS_KEY=
# CF_ACCOUNT_ID=

# Optional: Chat integrations
# TELEGRAM_BOT_TOKEN=
# DISCORD_BOT_TOKEN=
# SLACK_BOT_TOKEN=
# SLACK_APP_TOKEN=
EOF
            then
                error "Failed to create .dev.vars"
                return 1
            fi
            success "Created .dev.vars template"
        fi
    else
        success ".dev.vars already exists"
    fi

    return 0
}

# Setup wrangler secrets interactively or from env file
setup_secrets() {
    # If env file provided, run in non-interactive mode
    if [ -n "$ENV_FILE" ]; then
        setup_secrets_from_env
        return $?
    fi

    echo -e "${YELLOW}Would you like to configure Cloudflare secrets now? (y/n)${NC}"
    read -r response

    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        success "Skipping secrets configuration"
        return 0
    fi

    echo ""
    info "Setting up required secrets..."
    echo "You'll be prompted to enter each secret value."
    echo ""

    # Cloudflare AI Gateway (required)
    echo -e "${BLUE}1. Cloudflare AI Gateway Configuration (Required)${NC}"
    echo "   Set up at: https://dash.cloudflare.com/?to=/:account/ai/ai-gateway/general"
    echo ""

    local cf_account_id
    cf_account_id=$(get_env_or_prompt "CF_AI_GATEWAY_ACCOUNT_ID" "Enter CF_AI_GATEWAY_ACCOUNT_ID (your Cloudflare account ID):" "false" "true")
    if [ -n "$cf_account_id" ]; then
        if ! echo "$cf_account_id" | npx wrangler secret put CF_AI_GATEWAY_ACCOUNT_ID; then
            error "Failed to set CF_AI_GATEWAY_ACCOUNT_ID"
            return 1
        fi
        success "CF_AI_GATEWAY_ACCOUNT_ID configured"
    else
        error "CF_AI_GATEWAY_ACCOUNT_ID is required"
        return 1
    fi

    local cf_gateway_id
    cf_gateway_id=$(get_env_or_prompt "CF_AI_GATEWAY_GATEWAY_ID" "Enter CF_AI_GATEWAY_GATEWAY_ID (your AI Gateway ID):" "false" "true")
    if [ -n "$cf_gateway_id" ]; then
        if ! echo "$cf_gateway_id" | npx wrangler secret put CF_AI_GATEWAY_GATEWAY_ID; then
            error "Failed to set CF_AI_GATEWAY_GATEWAY_ID"
            return 1
        fi
        success "CF_AI_GATEWAY_GATEWAY_ID configured"
    else
        error "CF_AI_GATEWAY_GATEWAY_ID is required"
        return 1
    fi

    local cf_api_key
    cf_api_key=$(get_env_or_prompt "CLOUDFLARE_AI_GATEWAY_API_KEY" "Enter CLOUDFLARE_AI_GATEWAY_API_KEY (API key for AI Gateway):" "true" "true")
    if [ -n "$cf_api_key" ]; then
        if ! echo "$cf_api_key" | npx wrangler secret put CLOUDFLARE_AI_GATEWAY_API_KEY; then
            error "Failed to set CLOUDFLARE_AI_GATEWAY_API_KEY"
            return 1
        fi
        success "CLOUDFLARE_AI_GATEWAY_API_KEY configured"
    else
        error "CLOUDFLARE_AI_GATEWAY_API_KEY is required"
        return 1
    fi
    echo ""

    # MOLTBOT_GATEWAY_TOKEN
    echo -e "${BLUE}2. Gateway Token${NC}"

    # Check if token exists in environment
    local existing_token="${MOLTBOT_GATEWAY_TOKEN:-}"
    if [ -n "$existing_token" ]; then
        if ! echo "$existing_token" | npx wrangler secret put MOLTBOT_GATEWAY_TOKEN; then
            error "Failed to set MOLTBOT_GATEWAY_TOKEN"
            return 1
        fi
        success "MOLTBOT_GATEWAY_TOKEN configured from environment"
    else
        echo -e "${YELLOW}Generate a new gateway token? (y/n)${NC}"
        read -r gen_token
        if [[ "$gen_token" =~ ^[Yy]$ ]]; then
            local gateway_token
            gateway_token=$(openssl rand -hex 32)
            if ! echo "$gateway_token" | npx wrangler secret put MOLTBOT_GATEWAY_TOKEN; then
                error "Failed to set MOLTBOT_GATEWAY_TOKEN"
                return 1
            fi
            success "MOLTBOT_GATEWAY_TOKEN configured"
            info "Token: $gateway_token"
            info "Save this token - you'll need it to connect!"
        else
            warn "Skipped MOLTBOT_GATEWAY_TOKEN"
        fi
    fi
    echo ""

    # Cloudflare Access (optional)
    echo -e "${BLUE}3. Cloudflare Access (for admin UI auth) - Optional${NC}"

    # Check if CF Access vars exist in environment
    local env_team_domain="${CF_ACCESS_TEAM_DOMAIN:-}"
    local env_cf_aud="${CF_ACCESS_AUD:-}"

    if [ -n "$env_team_domain" ] || [ -n "$env_cf_aud" ]; then
        if [ -n "$env_team_domain" ]; then
            if ! echo "$env_team_domain" | npx wrangler secret put CF_ACCESS_TEAM_DOMAIN; then
                error "Failed to set CF_ACCESS_TEAM_DOMAIN"
                return 1
            fi
            success "CF_ACCESS_TEAM_DOMAIN configured from environment"
        fi
        if [ -n "$env_cf_aud" ]; then
            if ! echo "$env_cf_aud" | npx wrangler secret put CF_ACCESS_AUD; then
                error "Failed to set CF_ACCESS_AUD"
                return 1
            fi
            success "CF_ACCESS_AUD configured from environment"
        fi
    else
        echo -e "${YELLOW}Configure Cloudflare Access? (y/n)${NC}"
        read -r cf_access
        if [[ "$cf_access" =~ ^[Yy]$ ]]; then
            echo "Enter CF_ACCESS_TEAM_DOMAIN (e.g., myteam.cloudflareaccess.com):"
            read -r team_domain
            if [ -n "$team_domain" ]; then
                if ! echo "$team_domain" | npx wrangler secret put CF_ACCESS_TEAM_DOMAIN; then
                    error "Failed to set CF_ACCESS_TEAM_DOMAIN"
                    return 1
                fi
            fi

            echo "Enter CF_ACCESS_AUD (application audience UUID):"
            read -r cf_aud
            if [ -n "$cf_aud" ]; then
                if ! echo "$cf_aud" | npx wrangler secret put CF_ACCESS_AUD; then
                    error "Failed to set CF_ACCESS_AUD"
                    return 1
                fi
            fi
            success "Cloudflare Access configured"
        fi
    fi
    echo ""

    return 0
}

# Setup secrets from environment file (non-interactive)
setup_secrets_from_env() {
    info "Configuring secrets from environment file..."

    # Check required variables
    local missing=()
    for var in CF_AI_GATEWAY_ACCOUNT_ID CF_AI_GATEWAY_GATEWAY_ID CLOUDFLARE_AI_GATEWAY_API_KEY; do
        if [ -z "${!var:-}" ]; then
            missing+=("$var")
        fi
    done

    if [ ${#missing[@]} -gt 0 ]; then
        error "Missing required variables in environment file:"
        for var in "${missing[@]}"; do
            echo "  - $var"
        done
        return 1
    fi

    # Generate MOLTBOT_GATEWAY_TOKEN if not provided
    if [ -z "${MOLTBOT_GATEWAY_TOKEN:-}" ]; then
        info "MOLTBOT_GATEWAY_TOKEN not in env file, generating new token..."
        MOLTBOT_GATEWAY_TOKEN=$(openssl rand -hex 32)
        info "Token: $MOLTBOT_GATEWAY_TOKEN"
        info "Save this token - you'll need it to connect!"
    fi

    # Build JSON for wrangler secret bulk
    local json="{"
    local first=true

    for var in CF_AI_GATEWAY_ACCOUNT_ID CF_AI_GATEWAY_GATEWAY_ID CLOUDFLARE_AI_GATEWAY_API_KEY MOLTBOT_GATEWAY_TOKEN CF_ACCESS_TEAM_DOMAIN CF_ACCESS_AUD; do
        if [ -n "${!var:-}" ]; then
            if [ "$first" = true ]; then
                first=false
            else
                json+=","
            fi
            # Escape special characters in value for JSON
            local value="${!var}"
            value="${value//\\/\\\\}"
            value="${value//\"/\\\"}"
            json+="\"$var\":\"$value\""
        fi
    done

    json+="}"

    # Write to temp file and run wrangler secret bulk
    local tmpfile
    tmpfile=$(mktemp)
    echo "$json" > "$tmpfile"

    if npx wrangler secret bulk "$tmpfile"; then
        success "All secrets configured"
        rm -f "$tmpfile"
        return 0
    else
        error "Failed to set secrets"
        rm -f "$tmpfile"
        return 1
    fi
}

# Run type checking
run_typecheck() {
    info "Running type check..."

    if [ "$PKG_MANAGER" = "bun" ]; then
        if bun run typecheck; then
            success "Type check passed"
        else
            warn "Type check had issues (non-fatal)"
        fi
    else
        if npm run typecheck; then
            success "Type check passed"
        else
            warn "Type check had issues (non-fatal)"
        fi
    fi

    # Type check issues are non-fatal
    return 0
}

# Print next steps
print_next_steps() {
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}       Installation Complete!                   ${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Edit ${YELLOW}.dev.vars${NC} with your configuration"
    echo ""
    echo "  2. Start local development:"
    if [ "$PKG_MANAGER" = "bun" ]; then
        echo "     ${BLUE}bun run dev${NC}      # Vite dev server"
        echo "     ${BLUE}bun run start${NC}    # Wrangler local worker"
    else
        echo "     ${BLUE}npm run dev${NC}      # Vite dev server"
        echo "     ${BLUE}npm run start${NC}    # Wrangler local worker"
    fi
    echo ""
    echo "  3. Deploy to Cloudflare:"
    if [ "$PKG_MANAGER" = "bun" ]; then
        echo "     ${BLUE}bun run deploy${NC}"
    else
        echo "     ${BLUE}npm run deploy${NC}"
    fi
    echo ""
    echo "  4. Set production secrets (if not done):"
    echo "     ${BLUE}npx wrangler secret put CF_AI_GATEWAY_ACCOUNT_ID${NC}"
    echo "     ${BLUE}npx wrangler secret put CF_AI_GATEWAY_GATEWAY_ID${NC}"
    echo "     ${BLUE}npx wrangler secret put CLOUDFLARE_AI_GATEWAY_API_KEY${NC}"
    echo "     ${BLUE}npx wrangler secret put MOLTBOT_GATEWAY_TOKEN${NC}"
    echo ""
    echo "Useful commands:"
    echo "  ${BLUE}npm run test${NC}       - Run tests"
    echo "  ${BLUE}npm run lint${NC}       - Lint code"
    echo "  ${BLUE}npm run typecheck${NC}  - Check types"
    echo "  ${BLUE}npm run format${NC}     - Format code"
    echo ""
}

# Run a step with state tracking
run_step() {
    local step_name="$1"
    local step_idx="$2"
    local step_desc="${STEP_DESCRIPTIONS[$step_idx]}"

    echo ""
    info "Step $((step_idx + 1))/${#STEPS[@]}: $step_desc"

    # Save state before running (so we know where to resume if it fails)
    save_state "$step_name"

    # Run the step
    if ! "$step_name"; then
        echo ""
        error "Step failed: $step_desc"
        echo -e "${YELLOW}The installation state has been saved. Run the script again to resume.${NC}"
        exit 1
    fi
}

# Main installation flow
main() {
    local start_step
    start_step=$(check_resume)

    for i in "${!STEPS[@]}"; do
        # Skip steps before our resume point
        if [ "$i" -lt "$start_step" ]; then
            success "Skipping completed step: ${STEP_DESCRIPTIONS[$i]}"
            continue
        fi

        local step="${STEPS[$i]}"

        # Handle interactive steps
        case "$step" in
            "run_typecheck")
                echo ""
                echo -e "${YELLOW}Would you like to run type checking? (y/n)${NC}"
                read -r run_check
                if [[ ! "$run_check" =~ ^[Yy]$ ]]; then
                    success "Skipping: ${STEP_DESCRIPTIONS[$i]}"
                    continue
                fi
                ;;
            "setup_secrets")
                # setup_secrets handles its own prompting
                ;;
        esac

        run_step "$step" "$i"
    done

    # Installation complete - clear state
    clear_state
    print_next_steps
}

# Quick install mode (non-interactive)
quick_install() {
    clear_state
    info "Running quick install (non-interactive)..."

    for i in "${!STEPS[@]}"; do
        local step="${STEPS[$i]}"

        # Skip interactive-only steps in quick mode
        case "$step" in
            "run_typecheck"|"setup_secrets")
                success "Skipping (interactive): ${STEP_DESCRIPTIONS[$i]}"
                continue
                ;;
        esac

        run_step "$step" "$i"
    done

    clear_state
    print_next_steps
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --help|-h)
                echo "Usage: ./install.sh [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --help, -h              Show this help message"
                echo "  --quick, -q             Quick install (skip interactive prompts)"
                echo "  --deps-only             Only install dependencies"
                echo "  --reset                 Clear saved progress and start fresh"
                echo "  --status                Show current installation progress"
                echo "  --env-file <file>       Load secrets from .env file"
                echo "  -e <file>               Short form of --env-file"
                echo ""
                echo "Environment file format (.env):"
                echo "  CF_AI_GATEWAY_ACCOUNT_ID=your-account-id"
                echo "  CF_AI_GATEWAY_GATEWAY_ID=your-gateway-id"
                echo "  CLOUDFLARE_AI_GATEWAY_API_KEY=your-api-key"
                echo "  MOLTBOT_GATEWAY_TOKEN=your-token  # optional, will generate if missing"
                echo "  CF_ACCESS_TEAM_DOMAIN=myteam.cloudflareaccess.com  # optional"
                echo "  CF_ACCESS_AUD=your-aud  # optional"
                echo ""
                echo "Examples:"
                echo "  ./install.sh                      # Interactive installation"
                echo "  ./install.sh --quick              # Quick install, skip prompts"
                echo "  ./install.sh --env-file .env      # Use .env file for secrets"
                echo "  ./install.sh -e prod.env          # Use prod.env file for secrets"
                echo ""
                exit 0
                ;;
            --quick|-q)
                quick_install
                exit 0
                ;;
            --deps-only)
                check_prerequisites
                install_dependencies
                success "Dependencies installed"
                exit 0
                ;;
            --reset)
                clear_state
                success "Installation state cleared. Run ./install.sh to start fresh."
                exit 0
                ;;
            --status)
                show_status
                exit 0
                ;;
            --env-file|-e)
                if [ -z "${2:-}" ]; then
                    error "Missing argument for $1"
                    exit 1
                fi
                ENV_FILE="$2"
                if ! load_env_file "$ENV_FILE"; then
                    exit 1
                fi
                shift
                ;;
            -*)
                error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
            *)
                error "Unexpected argument: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
        shift
    done
}

# Show installation status
show_status() {
    local saved_step
    saved_step=$(get_saved_state)
    if [ -n "$saved_step" ]; then
        local step_idx
        step_idx=$(get_step_index "$saved_step")
        if [ "$step_idx" -ge 0 ]; then
            echo ""
            info "Installation progress:"
            for i in "${!STEPS[@]}"; do
                if [ "$i" -lt "$step_idx" ]; then
                    echo -e "  ${GREEN}✓${NC} ${STEP_DESCRIPTIONS[$i]}"
                elif [ "$i" -eq "$step_idx" ]; then
                    echo -e "  ${YELLOW}→${NC} ${STEP_DESCRIPTIONS[$i]} ${YELLOW}(interrupted)${NC}"
                else
                    echo -e "  ${BLUE}○${NC} ${STEP_DESCRIPTIONS[$i]}"
                fi
            done
            echo ""
            info "Run ./install.sh to resume from step $((step_idx + 1))"
        fi
    else
        success "No saved installation state. Ready to start fresh."
    fi
}

# Parse arguments and run
if [ $# -gt 0 ]; then
    parse_args "$@"
fi

# If we get here without exiting, run main
main
