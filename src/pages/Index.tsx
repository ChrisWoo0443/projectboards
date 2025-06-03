import { useState } from "react";
import { KanbanBoard } from "../components/Board";
import { CalendarView } from "../components/CalendarView";
import { ListView } from "../components/ListView";
import { Header } from "../components/Header";
import { CreateTask } from "../components/CreateTask";
import { ColumnManager } from "../components/ColumnManager";
import { Task, Column } from "../types/kanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task-1",
      title: "Design system updates",
      description: "Update the design tokens and component library",
      columnId: "todo",
      category: "design",
      priority: "high",
      dueDate: new Date("2025-06-10"),
      createdAt: new Date(),
    },
    {
      id: "task-2",
      title: "API integration",
      description: "Connect the frontend with the backend API",
      columnId: "in-progress",
      category: "development",
      priority: "medium",
      dueDate: new Date("2025-06-15"),
      createdAt: new Date(),
    },
    {
      id: "task-3",
      title: "User testing session",
      description: "Conduct usability testing with 5 users",
      columnId: "review",
      category: "research",
      priority: "low",
      dueDate: new Date("2025-06-20"),
      createdAt: new Date(),
    },
  ]);

  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", taskIds: ["task-1"] },
    { id: "in-progress", title: "In Progress", taskIds: ["task-2"] },
    { id: "review", title: "Review", taskIds: ["task-3"] },
    { id: "done", title: "Done", taskIds: [] },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [preSelectedColumnId, setPreSelectedColumnId] = useState<string | null>(null);

  const addTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
    };
    
    setTasks(prev => [...prev, task]);
    setColumns(prev => prev.map(col => 
      col.id === task.columnId 
        ? { ...col, taskIds: [...col.taskIds, task.id] }
        : col
    ));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setColumns(prev => prev.map(col => ({
      ...col,
      taskIds: col.taskIds.filter(id => id !== taskId)
    })));
  };

  const moveTask = (taskId: string, newColumnId: string, newIndex: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, columnId: newColumnId } : t
    ));

    setColumns(prev => {
      const newColumns = prev.map(col => ({
        ...col,
        taskIds: col.taskIds.filter(id => id !== taskId)
      }));

      return newColumns.map(col => {
        if (col.id === newColumnId) {
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(newIndex, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        }
        return col;
      });
    });
  };

  const updateColumn = (columnId: string, title: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, title } : col
    ));
  };

  const addColumn = (title: string) => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title,
      taskIds: []
    };
    setColumns(prev => [...prev, newColumn]);
  };

  const deleteColumn = (columnId: string) => {
    // Move tasks from deleted column to first column
    const tasksToMove = tasks.filter(task => task.columnId === columnId);
    const firstColumn = columns.find(col => col.id !== columnId);
    
    if (firstColumn) {
      setTasks(prev => prev.map(task => 
        task.columnId === columnId 
          ? { ...task, columnId: firstColumn.id }
          : task
      ));
      
      setColumns(prev => {
        const filtered = prev.filter(col => col.id !== columnId);
        return filtered.map(col => 
          col.id === firstColumn.id 
            ? { ...col, taskIds: [...col.taskIds, ...tasksToMove.map(t => t.id)] }
            : col
        );
      });
    }
  };

  const handleCreateTaskFromColumn = (columnId: string) => {
    setPreSelectedColumnId(columnId);
    setIsCreateModalOpen(true);
  };

  const handleCreateTaskFromHeader = () => {
    setPreSelectedColumnId(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setPreSelectedColumnId(null);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header 
        onCreateTask={handleCreateTaskFromHeader}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
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
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onCreateTask={addTask}
        columns={columns}
        preSelectedColumnId={preSelectedColumnId}
      />
    </div>
  );
};

export default Index;