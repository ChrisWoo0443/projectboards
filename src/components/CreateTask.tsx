import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { Column, CreateTaskData } from "../types/kanban";
import { TASK_PRIORITIES_ARRAY, TASK_CATEGORIES, DEFAULT_TASK_VALUES } from "../constants";
import { Label } from "./ui/label";

interface CreateTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: CreateTaskData) => void;
  columns: Column[];
  preSelectedColumnId?: string | null;
}

export const CreateTask = ({ isOpen, onClose, onCreateTask, columns, preSelectedColumnId }: CreateTaskProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: DEFAULT_TASK_VALUES.DESCRIPTION as string,
    columnId: preSelectedColumnId || (columns.length > 0 ? columns[0].id : ""),
    category: DEFAULT_TASK_VALUES.CATEGORY as string,
    priority: DEFAULT_TASK_VALUES.PRIORITY as "low" | "medium" | "high",
    dueDate: undefined as Date | undefined,
  });

  // Update columnId when preSelectedColumnId changes
  useEffect(() => {
    if (preSelectedColumnId) {
      setFormData(prev => ({ ...prev, columnId: preSelectedColumnId }));
    }
  }, [preSelectedColumnId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    const taskData = {
      ...formData,
      description: formData.description.trim(),
      category: formData.category.trim() || "General",
      priority: formData.priority || "medium",
      columnId: formData.columnId || preSelectedColumnId || "todo",
    };
    
    onCreateTask(taskData);
    setFormData({
      title: "",
      description: "",
      columnId: preSelectedColumnId || "todo",
      category: "",
      priority: "medium",
      dueDate: undefined,
    });
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: DEFAULT_TASK_VALUES.DESCRIPTION,
      columnId: preSelectedColumnId || (columns.length > 0 ? columns[0].id : ""),
      category: DEFAULT_TASK_VALUES.CATEGORY as string,
      priority: DEFAULT_TASK_VALUES.PRIORITY as "low" | "medium" | "high",
      dueDate: undefined,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDateInputChange = (value: string) => {
    if (!value) {
      setFormData(prev => ({ ...prev, dueDate: undefined }));
      return;
    }

    // Try to parse the date
    if (value.length === 10) {
      const [month, day, year] = value.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        setFormData(prev => ({ ...prev, dueDate: date }));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Column</Label>
              <Select
                value={formData.columnId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, columnId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(column => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES_ARRAY.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                value={typeof formData.dueDate === 'string' ? formData.dueDate : formData.dueDate ? formData.dueDate.toLocaleDateString('en-US') : ''}
                onChange={(e) => handleDateInputChange(e.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
