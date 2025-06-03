import { useState } from "react";
import { Board, CreateBoardData } from "../types/board";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Menu } from "lucide-react";

interface ProjectSelectorProps {
  boards: Board[];
  currentBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (data: CreateBoardData) => void;
}

export const ProjectSelector = ({
  boards,
  currentBoard,
  onSelectBoard,
  onCreateBoard,
}: ProjectSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

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
          <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
            <div className="space-y-2">
              {boards.map((board) => (
                <Button
                  key={board.id}
                  variant={currentBoard?.id === board.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onSelectBoard(board);
                    setIsOpen(false);
                  }}
                >
                  {board.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};