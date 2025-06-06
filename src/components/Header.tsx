import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { VIEW_TYPES } from "../constants";
import { HeaderPomodoroTimer } from "./HeaderPomodoroTimer";

interface HeaderProps {
    onCreateTask: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    currentBoard?: { name: string };
    onBoardNameChange?: (newName: string) => void;
  }
  
  export const Header = ({ onCreateTask, searchQuery, onSearchChange, currentBoard, onBoardNameChange }: HeaderProps) => {
    const { theme, setTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
  
    return (
      <div className="flex-1 flex items-center justify-between py-2">
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={() => {
                if (onBoardNameChange && editedName.trim()) {
                  onBoardNameChange(editedName.trim());
                }
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onBoardNameChange && editedName.trim()) {
                  onBoardNameChange(editedName.trim());
                  setIsEditing(false);
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="text-3xl font-bold w-64 bg-transparent border-none focus:border-none focus:ring-0"
            />
          ) : (
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80"
              onClick={() => {
                if (currentBoard) {
                  setEditedName(currentBoard.name);
                  setIsEditing(true);
                }
              }}
            >
              {currentBoard?.name || "Project Board"}
            </h1>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={onCreateTask}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <HeaderPomodoroTimer />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    );
  };