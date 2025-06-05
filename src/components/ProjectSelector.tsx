import { useState } from "react";
import { Board, CreateBoardData } from "../types/board";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Menu, Trash2, Pencil, X, ChevronLeft } from "lucide-react";
import { Separator } from "./ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { cn } from "../lib/utils";

interface ProjectSelectorProps {
  boards: Board[];
  currentBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (data: CreateBoardData) => void;
  onDeleteBoard: (boardId: string) => void;
  onBoardNameChange: (boardId: string, newName: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ProjectSelector = ({
  boards,
  currentBoard,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onBoardNameChange,
  isCollapsed,
  onToggleCollapse,
}: ProjectSelectorProps) => {
  const [newBoardName, setNewBoardName] = useState("");
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      onCreateBoard({ name: newBoardName.trim() });
      setNewBoardName("");
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Project Boards
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Create Board Section */}
          <div className="flex space-x-2">
            <Input
              placeholder="New board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
              className="flex-1"
            />
            <Button onClick={handleCreateBoard} size="sm">
              Create
            </Button>
          </div>

          <Separator />

          {/* Boards List */}
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-2">
              {boards.map((board) => (
                <div key={board.id} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    {editingBoardId === board.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (editingName.trim() && editingName !== board.name) {
                            onBoardNameChange(board.id, editingName.trim());
                          }
                          setEditingBoardId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editingName.trim() && editingName !== board.name) {
                            onBoardNameChange(board.id, editingName.trim());
                            setEditingBoardId(null);
                          } else if (e.key === 'Escape') {
                            setEditingBoardId(null);
                          }
                        }}
                        className="flex-1 h-8"
                        autoFocus
                      />
                    ) : (
                      <>
                        <Button
                          variant={currentBoard?.id === board.id ? "default" : "ghost"}
                          className="flex-1 justify-start h-8 px-3 text-sm"
                          onClick={() => onSelectBoard(board)}
                        >
                          <span className="truncate">{board.name}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => {
                            setEditingBoardId(board.id);
                            setEditingName(board.name);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  {boards.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Board</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{board.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteBoard(board.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Collapsed State - Show all boards as clickable indicators */}
      {isCollapsed && (
        <div className="p-2">
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="space-y-2">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105",
                    currentBoard?.id === board.id
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                  onClick={() => onSelectBoard(board)}
                  title={board.name}
                >
                  <span className="text-xs font-medium">
                    {board.name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};