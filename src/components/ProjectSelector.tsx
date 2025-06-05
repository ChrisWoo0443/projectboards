import { useState } from "react";
import { Board, CreateBoardData } from "../types/board";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Menu, Trash2, Pencil } from "lucide-react";
import { Separator } from "./ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";


interface ProjectSelectorProps {
  boards: Board[];
  currentBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (data: CreateBoardData) => void;
  onDeleteBoard: (boardId: string) => void;
  onBoardNameChange: (boardId: string, newName: string) => void;
}

export const ProjectSelector = ({
  boards,
  currentBoard,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onBoardNameChange,
}: ProjectSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Project Boards</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="New board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
            />
            <Button onClick={handleCreateBoard}>Create</Button>
          </div>
          <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
            <div className="space-y-4 mt-4 ml-3">
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
                        className="flex-1 bg-transparent border border-input px-3 py-1.5 rounded-md"
                        autoFocus
                      />
                    ) : (
                      <>
                        <Button
                          variant={currentBoard?.id === board.id ? "default" : "ghost"}
                          className="flex-1 justify-start pl-6 py-1.5"
                          onClick={() => {
                            onSelectBoard(board);
                            setIsOpen(false);
                          }}
                        >
                          {board.name}
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
                          <Pencil className="h-4 w-4" />
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
                          <Trash2 className="h-4 w-4" />
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
      </SheetContent>
    </Sheet>
  );
};