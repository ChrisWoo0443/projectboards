import { Task } from '../types/kanban';
import { Board } from '../types/board';
import { DEFAULT_TASK_VALUES } from '../constants';

interface UseTasksProps {
  currentBoard: Board | undefined;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
}

export const useTasks = ({ currentBoard, updateBoard }: UseTasksProps) => {
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    if (!currentBoard) return;

    const task: Task = {
      ...newTask,
      description: newTask.description || DEFAULT_TASK_VALUES.DESCRIPTION,
      category: newTask.category || DEFAULT_TASK_VALUES.CATEGORY,
      priority: newTask.priority || DEFAULT_TASK_VALUES.PRIORITY,
      completed: newTask.completed ?? DEFAULT_TASK_VALUES.COMPLETED,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
    };

    const updatedBoard = {
      ...currentBoard,
      tasks: [...currentBoard.tasks, task],
      columns: currentBoard.columns.map(col =>
        col.id === task.columnId
          ? { ...col, taskIds: [...col.taskIds, task.id] }
          : col
      ),
    };

    updateBoard(currentBoard.id, updatedBoard);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      tasks: currentBoard.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    };

    updateBoard(currentBoard.id, updatedBoard);
  };

  const deleteTask = (taskId: string) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      tasks: currentBoard.tasks.filter(task => task.id !== taskId),
      columns: currentBoard.columns.map(col => ({
        ...col,
        taskIds: col.taskIds.filter(id => id !== taskId),
      })),
    };

    updateBoard(currentBoard.id, updatedBoard);
  };

  const moveTask = (taskId: string, newColumnId: string, newIndex: number) => {
    if (!currentBoard) return;

    const task = currentBoard.tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldColumnId = task.columnId;

    const updatedBoard = {
      ...currentBoard,
      tasks: currentBoard.tasks.map(t =>
        t.id === taskId ? { ...t, columnId: newColumnId } : t
      ),
      columns: currentBoard.columns.map(col => {
        if (col.id === oldColumnId && col.id === newColumnId) {
          // Moving within the same column - reorder
          const newTaskIds = [...col.taskIds];
          const oldIndex = newTaskIds.indexOf(taskId);
          newTaskIds.splice(oldIndex, 1);
          newTaskIds.splice(newIndex, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        } else if (col.id === oldColumnId) {
          return { ...col, taskIds: col.taskIds.filter(id => id !== taskId) };
        } else if (col.id === newColumnId) {
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(newIndex, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        }
        return col;
      }),
    };

    updateBoard(currentBoard.id, updatedBoard);
  };

  return {
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  };
};