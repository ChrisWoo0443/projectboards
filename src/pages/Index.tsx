import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api";
import { KanbanBoard } from "../components/Board";
import { CalendarView } from "../components/CalendarView";
import { ListView } from "../components/ListView";
import { Header } from "../components/Header";
import { CreateTask } from "../components/CreateTask";
import { ColumnManager } from "../components/ColumnManager";
import { Task, Column } from "../types/kanban";
import { Board, CreateBoardData } from "../types/board";
import { ProjectSelector } from "../components/ProjectSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  const [boards, setBoards] = useState<Board[]>(() => {
    // Initialize with empty array, data will be loaded in useEffect
    return [];
  });

  useEffect(() => {
    // Load boards from file when component mounts
    const loadBoards = async () => {
      try {
        const boardsJson = await invoke('load_boards');
        const parsed = JSON.parse(boardsJson as string);
        const processedBoards = parsed.map((board: any) => ({
          ...board,
          tasks: board.tasks.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: new Date(task.createdAt),
          })),
          createdAt: new Date(board.createdAt),
        }));
        
        setBoards(processedBoards.length > 0 ? processedBoards : [{
          id: "board-1",
          name: "My First Board",
          createdAt: new Date(),
          columns: [
            { id: "todo", title: "To Do", taskIds: ["task-1"] },
            { id: "in-progress", title: "In Progress", taskIds: [] },
            { id: "review", title: "Review", taskIds: [] },
            { id: "done", title: "Done", taskIds: [] },
          ],
          tasks: [
            {
              id: "task-1",
              title: "Create Your First Task",
              description: "Press add task to get started",
              columnId: "todo",
              category: "General",
              priority: "high",
              dueDate: new Date("2025-06-10"),
              createdAt: new Date(),
            },
          ],
        }]);
      } catch (error) {
        console.error('Error loading boards:', error);
        toast({
          title: "Error loading boards",
          description: "Failed to load your boards. Using default board.",
          variant: "destructive"
        });
      }
    };

    loadBoards();
  }, []);

  useEffect(() => {
    // Save boards to file whenever they change
    const saveBoards = async () => {
      try {
        await invoke('save_boards', { boardsJson: JSON.stringify(boards) });
      } catch (error) {
        console.error('Error saving boards:', error);
        toast({
          title: "Error saving changes",
          description: "Failed to save your changes.",
          variant: "destructive"
        });
      }
    };

    if (boards.length > 0) {
      saveBoards();
    }
  }, [boards]);

  const [currentBoardId, setCurrentBoardId] = useState<string>("");

  useEffect(() => {
    if (boards.length > 0 && !currentBoardId) {
      setCurrentBoardId(boards[0].id);
    }
  }, [boards]);

  const currentBoard = boards.find(board => board.id === currentBoardId);
  const tasks = currentBoard?.tasks || [];
  const columns = currentBoard?.columns || [];

  // Columns are now managed within the board state

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [preSelectedColumnId, setPreSelectedColumnId] = useState<string | null>(null);

  const deleteBoard = (boardId: string) => {
    if (boards.length <= 1) {
      toast({
        title: "Cannot delete board",
        description: "You must have at least one board.",
        variant: "destructive"
      });
      return;
    }

    const remainingBoards = boards.filter(board => board.id !== boardId);
    setBoards(remainingBoards);
    
    if (currentBoardId === boardId) {
      setCurrentBoardId(remainingBoards[0].id);
    }
    
    toast({
      title: "Board deleted",
      description: `The board has been deleted successfully.`,
    });
  };

  const createBoard = (data: CreateBoardData) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name: data.name,
      createdAt: new Date(),
      columns: [
        { id: "todo", title: "To Do", taskIds: [] },
        { id: "in-progress", title: "In Progress", taskIds: [] },
        { id: "review", title: "Review", taskIds: [] },
        { id: "done", title: "Done", taskIds: [] },
      ],
      tasks: [],
    };

    setBoards(prev => [...prev, newBoard]);
    setCurrentBoardId(newBoard.id);
    toast({
      title: "Board created",
      description: `${newBoard.name} has been created successfully.`,
    });
  };

  const addTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    if (!currentBoard) return;

    const task: Task = {
      title: newTask.title,
      description: newTask.description || "",
      columnId: newTask.columnId,
      category: newTask.category || "General",
      priority: newTask.priority || "low",
      dueDate: newTask.dueDate,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
    };

    setBoards(prev =>
      prev.map(board =>
        board.id === currentBoardId
          ? {
              ...board,
              tasks: [...board.tasks, task],
              columns: board.columns.map(col =>
                col.id === task.columnId
                  ? { ...col, taskIds: [...col.taskIds, task.id] }
                  : col
              ),
            }
          : board
      )
    );
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setBoards(prev =>
      prev.map(board =>
        board.id === currentBoardId
          ? {
              ...board,
              tasks: board.tasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
            }
          : board
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setBoards(prev =>
      prev.map(board =>
        board.id === currentBoardId
          ? {
              ...board,
              tasks: board.tasks.filter(task => task.id !== taskId),
              columns: board.columns.map(col => ({
                ...col,
                taskIds: col.taskIds.filter(id => id !== taskId),
              })),
            }
          : board
      )
    );
  };

  const moveTask = (taskId: string, newColumnId: string, newIndex: number) => {
    if (!currentBoard) return;

    const task = currentBoard.tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldColumnId = task.columnId;

    setBoards(prev =>
      prev.map(board =>
        board.id === currentBoardId
          ? {
              ...board,
              tasks: board.tasks.map(t =>
                t.id === taskId ? { ...t, columnId: newColumnId } : t
              ),
              columns: board.columns.map(col => {
                if (col.id === oldColumnId) {
                  return {
                    ...col,
                    taskIds: col.taskIds.filter(id => id !== taskId),
                  };
                }
                if (col.id === newColumnId) {
                  const newTaskIds = [...col.taskIds];
                  newTaskIds.splice(newIndex, 0, taskId);
                  return {
                    ...col,
                    taskIds: newTaskIds,
                  };
                }
                return col;
              }),
            }
          : board
      )
    );
  };

  const updateColumn = (columnId: string, title: string) => {
    setBoards(prev =>
      prev.map(board =>
        board.id === currentBoardId
          ? {
              ...board,
              columns: board.columns.map(col =>
                col.id === columnId ? { ...col, title } : col
              ),
            }
          : board
      )
    );
  };

  const addColumn = (title: string) => {
    if (!currentBoard) return;
    
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title,
      taskIds: []
    };

    setBoards(prev =>
      prev.map(board =>
        board.id === currentBoardId
          ? {
              ...board,
              columns: [...board.columns, newColumn]
            }
          : board
      )
    );
  };

  const deleteColumn = (columnId: string) => {
    if (!currentBoard) return;

    const tasksToMove = currentBoard.tasks.filter(task => task.columnId === columnId);
    const firstColumn = currentBoard.columns.find(col => col.id !== columnId);

    if (firstColumn) {
      setBoards(prev =>
        prev.map(board =>
          board.id === currentBoardId
            ? {
                ...board,
                tasks: board.tasks.map(task =>
                  task.columnId === columnId
                    ? { ...task, columnId: firstColumn.id }
                    : task
                ),
                columns: board.columns
                  .filter(col => col.id !== columnId)
                  .map(col =>
                    col.id === firstColumn.id
                      ? {
                          ...col,
                          taskIds: [...col.taskIds, ...tasksToMove.map(t => t.id)],
                        }
                      : col
                  ),
              }
            : board
        )
      );
    }
  };

  const handleCreateTaskFromColumn = (columnId: string) => {
    setPreSelectedColumnId(columnId);
    setIsCreateOpen(true);
  };

  const handleCreateTaskFromHeader = () => {
    setPreSelectedColumnId(null);
    setIsCreateOpen(true);
  };

  const handleClose = () => {
    setIsCreateOpen(false);
    setPreSelectedColumnId(null);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <ProjectSelector
              boards={boards}
              currentBoard={currentBoard || null}
              onSelectBoard={(board) => setCurrentBoardId(board.id)}
              onCreateBoard={createBoard}
              onDeleteBoard={deleteBoard}
              onBoardNameChange={(boardId, newName) => {
                setBoards(prev =>
                  prev.map(board =>
                    board.id === boardId
                      ? { ...board, name: newName }
                      : board
                  )
                );
                toast({
                  title: "Board name updated",
                  description: `Board name has been updated to "${newName}".`
                });
              }}
            />
            <Header
              onCreateTask={handleCreateTaskFromHeader}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              currentBoard={currentBoard}
              onBoardNameChange={(newName) => {
                setBoards(prev =>
                  prev.map(board =>
                    board.id === currentBoardId
                      ? { ...board, name: newName }
                      : board
                  )
                );
                toast({
                  title: "Board name updated",
                  description: `Board name has been updated to "${newName}".`
                });
              }}
            />
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="board" className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="board">Board View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <ColumnManager
              columns={columns}
              onUpdateColumn={updateColumn}
              onAddColumn={addColumn}
              onDeleteColumn={deleteColumn}
            />
          </div>
          
          <TabsContent value="board">
            <KanbanBoard 
              tasks={filteredTasks}
              columns={columns}
              onMoveTask={moveTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onCreateTask={handleCreateTaskFromColumn}
            />
          </TabsContent>
          
          <TabsContent value="calendar">
            <CalendarView 
              tasks={filteredTasks}
              onUpdateTask={updateTask}
            />
          </TabsContent>
          
          <TabsContent value="list">
            <ListView 
              tasks={filteredTasks}
              columns={columns}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          </TabsContent>
        </Tabs>
      </main>

      <CreateTask
        isOpen={isCreateOpen}
        onClose={handleClose}
        onCreateTask={addTask}
        columns={columns}
        preSelectedColumnId={preSelectedColumnId}
      />
    </div>
  );
};

export default Index;