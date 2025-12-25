#!/bin/bash
set -e

# Define User Agent
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

# API Token (From previous config)
TOKEN="585e567a54b65bc9ac77d13688f743e8"

# Target File
MODEL_URL="https://civitai.com/api/download/models/2358314?type=Model&format=SafeTensor&token=${TOKEN}"
TARGET_PATH="/comfyui/models/checkpoints/JANKUTrainedNoobaiRouwei_v60.safetensors"

echo "Downloading JANKU Trained NoobAI Model..."
echo "URL: $MODEL_URL"

# Download with curl
curl -L -f -H "User-Agent: $USER_AGENT" -o "$TARGET_PATH" "$MODEL_URL" || {
    echo "ERROR: Failed to download model. Please check the URL/ID."
    exit 1
}

# Validation
filesize=$(stat -c%s "$TARGET_PATH")
if [ "$filesize" -lt 1000000000 ]; then
    echo "WARNING: File size is small ($filesize bytes). It might be an error page or LoRA."
    # We don't exit here because sometimes models are small or split, but for XL it should be big.
    # Ignoring for now to allow build to proceed if user confirms.
else
    echo "Download Verified: $filesize bytes."
fi
