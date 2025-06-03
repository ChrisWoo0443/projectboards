import { Task, Column } from './kanban';

export interface Board {
  id: string;
  name: string;
  createdAt: Date;
  columns: Column[];
  tasks: Task[];
}

export interface CreateBoardData {
  name: string;
}