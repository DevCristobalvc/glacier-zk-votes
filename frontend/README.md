# Glacier Frontend

React frontend for the Glacier anonymous voting system.

## Overview

This is the user interface for Glacier, built with React, TypeScript, and Vite. It provides a clean, modern interface for anonymous voting on Avalanche.

## Features

- **Wallet Integration**: Connect with MetaMask and Avalanche Wallet
- **ZK Proof Generation**: Generate zero-knowledge proofs in the browser
- **Vote Encryption**: Local AES encryption of votes
- **Real-time Updates**: Live election status and vote counts
- **Avalanche UI**: Design system inspired by Avalanche branding

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Radix UI** for accessible components
- **Ethers.js** for blockchain interaction
- **React Query** for state management

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── ElectionCard.tsx
│   ├── Header.tsx
│   └── VotingModal.tsx
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── assets/             # Static assets
```

## Integration with Monorepo

This frontend is part of the larger Glacier monorepo. It integrates with:

- **Smart Contracts**: Deployed on Avalanche Fuji/Mainnet
- **ZK Circuits**: For proof generation
- **Shared Types**: Common TypeScript definitions

## Environment Variables

Create a `.env.local` file:

```env
VITE_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_CONTRACT_ADDRESS=0x...
VITE_VERIFIER_ADDRESS=0x...
```

## Deployment

Build the project:

```bash
npm run build
```

Deploy the `dist/` folder to your preferred hosting service (Vercel, Netlify, etc.).
