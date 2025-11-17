#!/bin/bash

# Load NVM and use the correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Load Rust/Cargo
export PATH="$HOME/.cargo/bin:$PATH"

# Set PKG_CONFIG_PATH for GLib and GTK
export PKG_CONFIG_PATH="/usr/lib/x86_64-linux-gnu/pkgconfig:$PKG_CONFIG_PATH"

# Use Node.js LTS
nvm use --lts

# Run Tauri dev
npm run dev:linux
