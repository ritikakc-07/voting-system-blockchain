#!/usr/bin/env bash

# Script to deploy smart contract to the blockchain network
# Usage: ./deploy.sh <election|all> [rpc-url-or-name]

set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

# check if .env exists and load it
if [[ -f ".env" ]]; then
    set -a
    source ".env"
    set +a
fi

# check if required arguments are provided
TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
    echo "Error: No target network specified."
    echo "Usage: $0 <election|all> [rpc-url-or-name]"
    exit 1
fi

# check for RPC URL
RPC_INPUT="${2:-${RPC_URL:-}}"
if [[ -z "$RPC_INPUT" ]]; then
    echo "Error: No RPC URL provided. Pass an RPC URL or set RPC_URL in .env"
    exit 1
fi

if [[ "$RPC_INPUT" == "anvil" ]]; then
    RPC="http://127.0.0.1:8545"
else
    RPC="$RPC_INPUT"
fi

# check for private key
if [[ -z "${PRIVATE_KEY:-}" ]]; then
    echo "Error: No private key provided in .env"
    exit 1
fi

# target mapping
case "$TARGET" in 
    election|all)
        SCRIPT="script/Election.s.sol:DeployElectionScript"
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

forge script "$SCRIPT" \
    --rpc-url "$RPC" \
    --private-key "$PRIVATE_KEY" \
    --broadcast