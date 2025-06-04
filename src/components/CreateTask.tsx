import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { CreateTaskData, Column } from "../types/kanban";
import { cn } from "../lib/utils";

interface CreateTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: CreateTaskData) => void;
  columns: Column[];
  preSelectedColumnId?: string | null;
}

export const CreateTask = ({ isOpen, onClose, onCreateTask, columns, preSelectedColumnId }: CreateTaskProps) => {
  const [formData, setFormData] = useState<CreateTaskData & { dueDate?: Date | string }>({ 
    title: "",
    description: "",
    columnId: "todo",
    category: "",
    priority: "medium",
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
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      columnId: "todo",
      category: "",
      priority: "medium",
    });
    onClose();
  };

  const handleDateChange = (value: string) => {
    if (!value) {
      setFormData(prev => ({ ...prev, dueDate: undefined }));
      return;
    }

    if (value.length <= 10) { // Only update while typing the date
      setFormData(prev => ({ ...prev, dueDate: value }));
    }

    // Try to parse the completed date
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
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter custom category..."
              />
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                value={typeof formData.dueDate === 'string' ? formData.dueDate : formData.dueDate ? formData.dueDate.toLocaleDateString('en-US') : ''}
                onChange={(e) => handleDateChange(e.target.value)}
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
