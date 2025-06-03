import { useState } from "react";
import { Column } from "../types/kanban";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Edit2, Plus, Trash2, Settings } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface ColumnManagerProps {
  columns: Column[];
  onUpdateColumn: (columnId: string, title: string) => void;
  onAddColumn: (title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const ColumnManager = ({ columns, onUpdateColumn, onAddColumn, onDeleteColumn }: ColumnManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const handleEditColumn = (column: Column) => {
    setEditingColumn(column.id);
    setEditTitle(column.title);
  };

  const handleSaveEdit = () => {
    if (editingColumn && editTitle.trim()) {
      onUpdateColumn(editingColumn, editTitle.trim());
      setEditingColumn(null);
      setEditTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingColumn(null);
    setEditTitle("");
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      onAddColumn(newColumnTitle.trim());
      setNewColumnTitle("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Existing Columns</h4>
            {columns.map((column) => (
              <div key={column.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {editingColumn === column.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-medium">{column.title}</span>
                      <Badge variant="secondary" className="ml-2">
                        {column.taskIds.length} tasks
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditColumn(column)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {columns.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteColumn(column.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Add New Column</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Column name"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              />
              <Button onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};