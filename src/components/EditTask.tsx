import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

import { format } from "date-fns";
import { Task } from "../types/kanban";
import { cn } from "../lib/utils";

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
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date (MM/DD/YYYY)</Label>
            <Input
              id="dueDate"
              value={typeof formData.dueDate === 'string' ? formData.dueDate : formData.dueDate ? format(formData.dueDate as Date, "MM/dd/yyyy") : ""}
              onChange={(e) => {
                const dateStr = e.target.value;
                const dateParts = dateStr.split("/");
                
                // Allow incomplete date input
                if (dateParts.length <= 3 && dateStr.length <= 10) {
                  // Keep the raw input value while typing
                  setFormData(prev => ({ ...prev, dueDate: dateStr }));
                  
                  // Only parse and set Date object when input is complete
                  if (dateParts.length === 3 && dateStr.length === 10) {
                    const month = parseInt(dateParts[0]) - 1;
                    const day = parseInt(dateParts[1]);
                    const year = parseInt(dateParts[2]);
                    const date = new Date(year, month, day);
                    
                    if (!isNaN(date.getTime())) {
                      setFormData(prev => ({ ...prev, dueDate: date }));
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
