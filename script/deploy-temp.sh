#!/usr/bin/env bash

# Script to deploy smart contract to the blockchain network
# Usage: ./script/deploy.sh <election|all> <network-or-rpc-url>

set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

# check if .env exists and load it
if [[ -f ".env" ]]; then
    set -a
    source ".env"
    set +a
fi

# check if target argument is provided
TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
    echo "Error: No target specified."
    echo "Usage: $0 <election|all> <network-or-rpc-url>"
    exit 1
fi

# check for Network name or RPC URL
RPC_INPUT="${2:-${RPC_URL:-}}"
if [[ -z "$RPC_INPUT" ]]; then
    echo "Error: No RPC URL or network name provided."
    exit 1
fi

# Translate text shortcuts like "anvil" to local URLs
if [[ "$RPC_INPUT" == "anvil" || "$RPC_INPUT" == "localhost" ]]; then
    RPC="http://127.0.0.1:8545"
else
    RPC="$RPC_INPUT"
fi

# check for private key (strictly from .env or fallback environment)
if [[ -z "${PRIVATE_KEY:-}" ]]; then
    echo "Error: No private key provided. Set PRIVATE_KEY in your .env file."
    exit 1
fi

# target mapping - FIX: Points to Deploy instead of DeployElectionScript
case "$TARGET" in 
    election|all)
        SCRIPT="script/Election.s.sol:Deploy"
        ;;
    *)
        echo "Unknown target: $TARGET"
        echo "Use: election | all"
        exit 1
        ;;
esac

echo "Deploying via Foundry Script..."
echo "  Target: $TARGET"
echo "  RPC:    $RPC"
echo "  Script: $SCRIPT"
echo ""

# Trigger the deployment
forge script "$SCRIPT" \
    --rpc-url "$RPC" \
    --private-key "$PRIVATE_KEY" \
    --broadcast