# Project Boards - Kanban Task Management

A modern, feature-rich Kanban board application built with React, TypeScript, and Tauri for cross-platform desktop support.

## 🚀 Features

- **Multiple Views**: Board, List, and Calendar views for different workflow preferences
- **Drag & Drop**: Intuitive task and column reordering with react-beautiful-dnd
- **Task Management**: Create, edit, delete, and organize tasks with categories and priorities
- **Multiple Boards**: Support for multiple project boards with easy switching
- **Search & Filter**: Real-time search and advanced filtering options
- **Due Dates**: Calendar integration with overdue and upcoming task tracking
- **Dark Mode**: Built-in theme switching for better user experience
- **Persistent Storage**: Local file-based storage using Tauri's file system API

## 🏗️ Architecture

The codebase has been refactored to follow modern React best practices with a clean, maintainable architecture:

### 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── Board.tsx       # Kanban board view
│   ├── TaskCard.tsx    # Individual task component
│   ├── CreateTask.tsx  # Task creation modal
│   ├── EditTask.tsx    # Task editing modal
│   ├── ListView.tsx    # List view component
│   ├── CalendarView.tsx # Calendar view component
│   └── Header.tsx      # Application header
├── hooks/              # Custom React hooks
│   ├── useBoards.ts    # Board management logic
│   ├── useTasks.ts     # Task management logic
│   └── useColumns.ts   # Column management logic
├── utils/              # Utility functions
│   ├── taskUtils.ts    # Task-related utilities
│   └── utils.ts        # General utilities
├── constants/          # Application constants
│   └── index.ts        # Centralized constants
├── types/              # TypeScript type definitions
│   ├── kanban.ts       # Task and column types
│   └── board.ts        # Board types
├── contexts/           # React contexts
├── lib/                # External library configurations
└── pages/              # Main application pages
    └── Index.tsx       # Main application component
```

### 🔧 Key Improvements

#### 1. **Custom Hooks for State Management**
- `useBoards`: Manages board creation, deletion, and persistence
- `useTasks`: Handles all task operations (CRUD + moving)
- `useColumns`: Manages column operations and reordering

#### 2. **Centralized Constants**
- Task priorities, categories, and default values
- UI configuration settings
- Drag & drop types
- View types for consistent referencing

#### 3. **Utility Functions**
- Task filtering and searching
- Task sorting by multiple criteria
- Date-based task categorization (overdue, due soon)
- Color utilities for categories and priorities
- ID generation utilities

#### 4. **Improved Type Safety**
- Comprehensive TypeScript interfaces
- Strict typing for all props and state
- Type-safe utility functions

#### 5. **Better Code Organization**
- Separation of concerns
- Reusable components
- Consistent naming conventions
- Clear file structure

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Desktop**: Tauri (Rust-based)
- **Drag & Drop**: react-beautiful-dnd
- **Date Handling**: date-fns
- **State Management**: React hooks + local state
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd projectboards
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Tauri CLI** (if not already installed)
   ```bash
   npm install -g @tauri-apps/cli
   ```

4. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

5. **Build for production**
   ```bash
   npm run tauri build
   ```

## 🎯 Usage

### Creating Tasks
1. Click the "+" button in any column or use the main "Add Task" button
2. Fill in task details (title, description, category, priority, due date)
3. Select the target column
4. Click "Create Task"

### Managing Boards
1. Use the sidebar to switch between boards
2. Create new boards with the "+" button in the sidebar
3. Delete boards using the dropdown menu (minimum one board required)

### View Modes
- **Board View**: Traditional Kanban board with drag & drop
- **List View**: Sortable list with filtering options
- **Calendar View**: Calendar-based view showing due dates

### Search and Filtering
- Use the search bar to filter tasks by title, description, or category
- In List view, use advanced sorting by due date, priority, category, or title

## 🔄 Data Persistence

The application uses Tauri's file system API to persist data locally:
- Boards and tasks are saved automatically
- Data is stored in JSON format
- Cross-platform file handling

## 🎨 Theming

The application supports light and dark themes:
- Toggle using the theme switcher in the header
- Automatic system theme detection
- Consistent styling across all components

## 🧪 Code Quality

The refactored codebase emphasizes:
- **Readability**: Clear, self-documenting code
- **Maintainability**: Modular architecture with separation of concerns
- **Reusability**: Shared components and utilities
- **Type Safety**: Comprehensive TypeScript coverage
- **Performance**: Optimized rendering and state management
- **Consistency**: Unified coding patterns and conventions

## 🚀 Future Enhancements

- [ ] Real-time collaboration
- [ ] Cloud synchronization
- [ ] Advanced filtering and search
- [ ] Task templates
- [ ] Time tracking
- [ ] Export/import functionality
- [ ] Mobile responsive design
- [ ] Keyboard shortcuts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Ensure TypeScript compilation passes
5. Test your changes thoroughly
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
