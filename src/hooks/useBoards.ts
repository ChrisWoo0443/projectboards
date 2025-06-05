import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api';
import { Board, CreateBoardData } from '../types/board';
import { useToast } from '../components/ui/use-toast';
import { DEFAULT_COLUMNS, TOAST_MESSAGES, TASK_PRIORITIES } from '../constants';

const DEFAULT_BOARD: Board = {
  id: 'board-1',
  name: 'My First Board',
  createdAt: new Date(),
  columns: [
    { id: 'todo', title: 'To Do', taskIds: ['task-1'] },
    { id: 'in-progress', title: 'In Progress', taskIds: [] },
    { id: 'review', title: 'Review', taskIds: [] },
    { id: 'done', title: 'Done', taskIds: [] },
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Create Your First Task',
      description: 'Press add task to get started',
      columnId: 'todo',
      category: 'General',
      priority: TASK_PRIORITIES.HIGH,
      dueDate: new Date('2025-06-10'),
      createdAt: new Date(),
    },
  ],
};

export const useBoards = () => {
  const { toast } = useToast();
  const [boards, setBoards] = useState<Board[]>([DEFAULT_BOARD]);
  const [currentBoardId, setCurrentBoardId] = useState<string>('board-1');

  // Load boards from storage
  useEffect(() => {
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
        
        setBoards(processedBoards.length > 0 ? processedBoards : [DEFAULT_BOARD]);
      } catch (error) {
        console.error('Error loading boards:', error);
        toast(TOAST_MESSAGES.LOAD_ERROR);
      }
    };

    loadBoards();
  }, [toast]);

  // Save boards to storage
  useEffect(() => {
    const saveBoards = async () => {
      try {
        await invoke('save_boards', { boardsJson: JSON.stringify(boards) });
      } catch (error) {
        console.error('Error saving boards:', error);
        toast(TOAST_MESSAGES.SAVE_ERROR);
      }
    };

    if (boards.length > 0) {
      saveBoards();
    }
  }, [boards, toast]);

  // Update current board when boards change
  useEffect(() => {
    if (boards.length > 0 && !boards.find(board => board.id === currentBoardId)) {
      setCurrentBoardId(boards[0].id);
    }
  }, [boards, currentBoardId]);

  const currentBoard = boards.find(board => board.id === currentBoardId);

  const createBoard = (data: CreateBoardData) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name: data.name,
      createdAt: new Date(),
      columns: DEFAULT_COLUMNS,
      tasks: [],
    };

    setBoards(prev => {
      const updatedBoards = [...prev, newBoard];
      setTimeout(() => setCurrentBoardId(newBoard.id), 0);
      return updatedBoards;
    });
    
    toast(TOAST_MESSAGES.BOARD_CREATED(newBoard.name));
  };

  const deleteBoard = (boardId: string) => {
    if (boards.length <= 1) {
      toast(TOAST_MESSAGES.BOARD_DELETE_ERROR);
      return;
    }

    const remainingBoards = boards.filter(board => board.id !== boardId);
    setBoards(remainingBoards);
    
    if (currentBoardId === boardId) {
      setCurrentBoardId(remainingBoards[0].id);
    }
    
    toast(TOAST_MESSAGES.BOARD_DELETED);
  };

  const updateBoard = (boardId: string, updates: Partial<Board>) => {
    setBoards(prev =>
      prev.map(board =>
        board.id === boardId ? { ...board, ...updates } : board
      )
    );
  };

  return {
    boards,
    currentBoard,
    currentBoardId,
    setCurrentBoardId,
    createBoard,
    deleteBoard,
    updateBoard,
  };
};