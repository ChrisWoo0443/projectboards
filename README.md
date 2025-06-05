# Project Boards

A modern, desktop-based project management application built with Tauri, React, and TypeScript. This application combines the performance of native applications with the flexibility of web technologies to deliver a seamless project management experience.

## Features

- **Task Management**: Create, edit, and organize tasks with an intuitive interface
- **Multiple Views**: Switch between Board (Kanban), List, and Calendar views
- **Project Organization**: Manage multiple projects with the project selector
- **Responsive Design**: Optimized for both desktop and mobile views
- **Modern UI**: Built with React and Tailwind CSS for a beautiful user experience

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Desktop Framework**: Tauri (Rust-based)
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Authentication**: Supabase

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Rust (latest stable version)
- Tauri CLI

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd projectboards
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run tauri dev
```

### Building

To create a production build:

```bash
npm run tauri build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle` directory.

### Option 2:

1. Install .dmg through the release page of this repo
2. drag project-boards to applications folder
3. Run this command with this path or change it to where you choose to put the app
```
xattr -cr /Applications/project-boards.app
```
4. run the application



## Project Structure

```
projectboards/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   └── types/             # TypeScript type definitions
├── src-tauri/             # Tauri/Rust backend
│   ├── src/               # Rust source code
│   └── tauri.conf.json    # Tauri configuration
└── public/                # Static assets
```
