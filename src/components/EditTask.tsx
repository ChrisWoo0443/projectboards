import React, { useState, useEffect } from "react";
import { Task } from "../types/kanban";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
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
import { TASK_PRIORITIES_ARRAY, TASK_CATEGORIES } from "../constants";
import { parseDateString, formatDateToString } from '../utils/dateUtils';

interface EditTaskProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updates: Partial<Task>) => void;
}

export const EditTask = ({ task, isOpen, onClose, onUpdateTask }: EditTaskProps) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    dueDate: task.dueDate,
  });

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
    });
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onUpdateTask(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
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
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
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
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date (MM/DD/YYYY)</Label>
            <Input
              id="dueDate"
              value={typeof formData.dueDate === 'string' ? formData.dueDate : formData.dueDate ? formatDateToString(formData.dueDate as Date) : ""}
              onChange={(e) => {
                const dateStr = e.target.value;
                
                if (dateStr.length <= 10) {
                  // Keep the raw input value while typing
                  setFormData(prev => ({ ...prev, dueDate: dateStr }));
                  
                  // Only parse and set Date object when input is complete
                  if (dateStr.length === 10) {
                    const parseResult = parseDateString(dateStr);
                    
                    if (parseResult.isValid && parseResult.date) {
                      setFormData(prev => ({ ...prev, dueDate: parseResult.date! }));
                    }
                  }
                }
              }}
              placeholder="MM/DD/YYYY"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              Update Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
