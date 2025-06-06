import React, { useState } from "react";
import { KanbanBoard } from "../components/Board";
import { CalendarView } from "../components/CalendarView";
import { ListView } from "../components/ListView";
import { Header } from "../components/Header";
import { CreateTask } from "../components/CreateTask";
import { ColumnManager } from "../components/ColumnManager";
import { ProjectSelector } from "../components/ProjectSelector";
import { GamificationWidget } from "../components/GamificationWidget";
import { GamificationNotifications } from "../components/GamificationNotifications";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useBoards } from "../hooks/useBoards";
import { useTasks } from "../hooks/useTasks";
import { useColumns } from "../hooks/useColumns";
import { useGamification } from "../hooks/useGamification";
import { filterTasksBySearch } from "../utils/taskUtils";
import { UI_CONFIG, VIEW_TYPES } from "../constants";
import { useToast } from "../components/ui/use-toast";
import { Task } from "../types/kanban";

const Index = () => {
  const { toast } = useToast();
  
  // Custom hooks for state management
  const {
    boards,
    currentBoard,
    currentBoardId,
    setCurrentBoardId,
    createBoard,
    deleteBoard,
    updateBoard,
  } = useBoards();

  const { addTask, updateTask, deleteTask, moveTask } = useTasks({
    currentBoard,
    updateBoard,
  });

  const { addColumn, updateColumn, moveColumn, deleteColumn } = useColumns({
    currentBoard,
    updateBoard,
  });

  // Local component state
  const tasks = currentBoard?.tasks || [];
  
  // Get all tasks from all boards for gamification
  const allTasks = boards.flatMap(board => board.tasks || []);
  
  // Gamification hook
  const {
    userStats,
    pointsHistory,
    dailyChallenge,
    showLevelUp,
    showAchievement,
    isLoaded: gamificationLoaded,
    handleTaskCompletion,
    updateWeeklyGoal,
    resetGamification,
    getUnlockedAchievements,
    getLockedAchievements,
    getRecentPointsHistory,
    setShowLevelUp,
    setShowAchievement,
  } = useGamification(allTasks);
  const columns = currentBoard?.columns || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [preSelectedColumnId, setPreSelectedColumnId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(UI_CONFIG.SIDEBAR_COLLAPSED_DEFAULT);

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

  // Enhanced task update handler with gamification
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.completed;
    const isNowCompleted = updates.completed;

    updateTask(taskId, updates);

    // Handle gamification for task completion
    if (!wasCompleted && isNowCompleted && gamificationLoaded) {
      const updatedTask = { ...task, ...updates };
      handleTaskCompletion(updatedTask);
      
      toast({
        title: "Task completed! 🎉",
        description: `You earned points for completing "${task.title}"`
      });
    }
  };

  // Filter tasks based on search query
  const filteredTasks = filterTasksBySearch(tasks, searchQuery);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Gamification Notifications */}
      <GamificationNotifications
        userLevel={userStats.level}
        showLevelUp={showLevelUp}
        showAchievement={showAchievement}
        onCloseLevelUp={() => setShowLevelUp(false)}
        onCloseAchievement={() => setShowAchievement(null)}
      />
      {/* Sidebar */}
      <ProjectSelector
        boards={boards}
        currentBoard={currentBoard || null}
        onSelectBoard={(board) => setCurrentBoardId(board.id)}
        onCreateBoard={createBoard}
        onDeleteBoard={deleteBoard}
        onBoardNameChange={(boardId, newName) => {
          updateBoard(boardId, { name: newName });
          toast({
            title: "Board name updated",
            description: `Board name has been updated to "${newName}".`
          });
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-80'}`}>
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-6 py-6">
            <Header
              onCreateTask={handleCreateTaskFromHeader}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              currentBoard={currentBoard}
              onBoardNameChange={(newName) => {
                updateBoard(currentBoardId, { name: newName });
                toast({
                  title: "Board name updated",
                  description: `Board name has been updated to "${newName}".`
                });
              }}
              userStats={userStats}
              dailyChallenge={dailyChallenge}
              pointsHistory={pointsHistory}
              onUpdateWeeklyGoal={updateWeeklyGoal}
              onResetData={resetGamification}
            />
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={VIEW_TYPES.BOARD} className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
               <TabsTrigger value={VIEW_TYPES.BOARD}>Board View</TabsTrigger>
               <TabsTrigger value={VIEW_TYPES.CALENDAR}>Calendar View</TabsTrigger>
               <TabsTrigger value={VIEW_TYPES.LIST}>List View</TabsTrigger>
             </TabsList>
            
            <ColumnManager
              columns={columns}
              onUpdateColumn={updateColumn}
              onAddColumn={addColumn}
              onDeleteColumn={deleteColumn}
            />
          </div>
          
          <TabsContent value={VIEW_TYPES.BOARD}>
            {currentBoard && (
              <KanbanBoard
                tasks={filteredTasks}
                columns={currentBoard.columns}
                onMoveTask={moveTask}
                onUpdateTask={handleTaskUpdate}
                onDeleteTask={deleteTask}
                onCreateTask={handleCreateTaskFromColumn}
                onUpdateColumn={updateColumn}
                onMoveColumn={moveColumn}
              />
            )}
          </TabsContent>
          
          <TabsContent value={VIEW_TYPES.CALENDAR}>
            <CalendarView 
              tasks={filteredTasks}
              onUpdateTask={handleTaskUpdate}
            />
          </TabsContent>
          
          <TabsContent value={VIEW_TYPES.LIST}>
            <ListView 
              tasks={filteredTasks}
              columns={columns}
              onUpdateTask={handleTaskUpdate}
              onDeleteTask={deleteTask}
            />
          </TabsContent>
          



        </Tabs>
        </main>
      </div>

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