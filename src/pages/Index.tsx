import { useState, useEffect } from "react";
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
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
  const { toast } = useToast();

  const { user } = useAuth();
const [boards, setBoards] = useState<Board[]>(() => {
    const stored = localStorage.getItem(`boards-${user?.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((board: any) => ({
        ...board,
        tasks: board.tasks.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
        })),
        createdAt: new Date(board.createdAt),
      }));
    }
    return [
      {
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
      },
    ];
  });

  const [currentBoardId, setCurrentBoardId] = useState<string>(() => {
    return boards[0]?.id || "";
  });

  const currentBoard = boards.find(board => board.id === currentBoardId);
  const tasks = currentBoard?.tasks || [];
  const columns = currentBoard?.columns || [];

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`boards-${user.id}`, JSON.stringify(boards));
    }
  }, [boards, user?.id]);

  // Columns are now managed within the board state

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [preSelectedColumnId, setPreSelectedColumnId] = useState<string | null>(null);

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <ProjectSelector
              boards={boards}
              currentBoard={currentBoard || null}
              onSelectBoard={(board) => setCurrentBoardId(board.id)}
              onCreateBoard={createBoard}
            />
            <Header
              onCreateTask={handleCreateTaskFromHeader}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
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