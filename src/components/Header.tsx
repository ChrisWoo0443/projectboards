import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
    onCreateTask: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    currentBoard?: { name: string };
  }
  
  export const Header = ({ onCreateTask, searchQuery, onSearchChange, currentBoard }: HeaderProps) => {
    const { theme, setTheme } = useTheme();
  
    return (
      <div className="flex-1 flex items-center justify-between py-2">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            {currentBoard?.name || "Project Board"}
          </h1>
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