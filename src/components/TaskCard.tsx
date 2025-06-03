import { useState } from "react";
import { Task } from "../types/kanban";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { format } from "date-fns";
import { EditTask } from "./EditTask";

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

export const TaskCard = ({ task, onUpdate, onDelete }: TaskCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getCategoryColor = (category: Task['category']) => {
    const colors = {
      design: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      development: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      research: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      marketing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[category];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[priority];
  };

  const isOverdue = task.dueDate && new Date() > task.dueDate;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm leading-tight">
            {task.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-slate-600 dark:text-slate-400 text-xs mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className={getCategoryColor(task.category)}>
            {task.category}
          </Badge>
          <Badge variant="secondary" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>

        {task.dueDate && (
          <div className={`flex items-center text-xs ${
            isOverdue 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            <Calendar className="h-3 w-3 mr-1" />
            {format(task.dueDate, 'MMM d, yyyy')}
            {isOverdue && <span className="ml-1 font-medium">(Overdue)</span>}
          </div>
        )}
      </div>

      <EditTask
        task={task}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdateTask={onUpdate}
      />
    </>
  );
};
