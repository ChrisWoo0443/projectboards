import { Column } from '../types/kanban';
import { Board } from '../types/board';

interface UseColumnsProps {
  currentBoard: Board | undefined;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
}

export const useColumns = ({ currentBoard, updateBoard }: UseColumnsProps) => {
  const addColumn = (title: string) => {
    if (!currentBoard) return;
    
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title,
      taskIds: []
    };

    const updatedBoard = {
      ...currentBoard,
      columns: [...currentBoard.columns, newColumn]
    };

    updateBoard(currentBoard.id, updatedBoard);
  };

  const updateColumn = (columnId: string, title: string) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(col =>
        col.id === columnId ? { ...col, title } : col
      ),
    };

    updateBoard(currentBoard.id, updatedBoard);
  };

  const moveColumn = (columnId: string, newIndex: number) => {
    if (!currentBoard) return;

    const newColumns = [...currentBoard.columns];
    const oldIndex = newColumns.findIndex(col => col.id === columnId);
    const [movedColumn] = newColumns.splice(oldIndex, 1);
    newColumns.splice(newIndex, 0, movedColumn);

    const updatedBoard = {
      ...currentBoard,
      columns: newColumns
    };

    updateBoard(currentBoard.id, updatedBoard);
  };

  const deleteColumn = (columnId: string) => {
    if (!currentBoard) return;

    const tasksToMove = currentBoard.tasks.filter(task => task.columnId === columnId);
    const firstColumn = currentBoard.columns.find(col => col.id !== columnId);

    if (firstColumn) {
      const updatedBoard = {
        ...currentBoard,
        tasks: currentBoard.tasks.map(task =>
          task.columnId === columnId
            ? { ...task, columnId: firstColumn.id }
            : task
        ),
        columns: currentBoard.columns
          .filter(col => col.id !== columnId)
          .map(col =>
            col.id === firstColumn.id
              ? {
                  ...col,
                  taskIds: [...col.taskIds, ...tasksToMove.map(t => t.id)],
                }
              : col
          ),
      };

      updateBoard(currentBoard.id, updatedBoard);
    }
  };

  return {
    addColumn,
    updateColumn,
    moveColumn,
    deleteColumn,
  };
};