# zlend Frontend

This repository contains the frontend applications for zlend:

- `app/`: The main application
- `landing/`: The landing page

## Setup

```bash
# Install all dependencies
npm install

# Start the landing page development server
npm run start:landing

# Start the main app development server
npm run start:app
```

## Building

```bash
# Build the landing page
npm run build:landing

# Build the main app
npm run build:app
```

## Project Structure

This is a monorepo using npm workspaces to manage multiple projects.

## Development

Each project can be developed independently, but they share the same repository and can share code when needed. 