import React, { useState } from "react";
import { Task } from "../types/kanban";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, MoreHorizontal, Trash2, Edit, Star, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { format } from "date-fns";
import { EditTask } from "./EditTask";
import { getCategoryColor, getPriorityColor } from '../utils/taskUtils';
import { isTaskOverdue } from "../utils/taskUtils";
import { calculateTaskPoints } from '../utils/gamificationUtils';

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

export const TaskCard = ({ task, onUpdate, onDelete }: TaskCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOverdue = isTaskOverdue(task);
  const potentialPoints = calculateTaskPoints(task);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => onUpdate({ completed: !task.completed })}
              className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors flex items-center justify-center group"
              style={{
                backgroundColor: task.completed ? '#10b981' : 'transparent',
                borderColor: task.completed ? '#10b981' : undefined
              }}
              title={task.completed ? 'Mark as incomplete' : `Complete task (+${potentialPoints} points)`}
            >
              {task.completed ? (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <Zap className="w-3 h-3 text-slate-400 group-hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
            <h4 className={`font-medium text-slate-900 dark:text-slate-100 text-sm leading-tight flex-1 ${
              task.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
            }`}>
              {task.title}
            </h4>
          </div>
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
          {!task.completed && (
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
              <Star className="w-3 h-3 mr-1" />
              {potentialPoints}pts
            </Badge>
          )}
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
            {task.dueTime && <span className="ml-1"></span>}
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
