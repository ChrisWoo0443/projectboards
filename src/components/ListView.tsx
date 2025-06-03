import { useState } from "react";
import { Task, Column } from "../types/kanban";
import { TaskCard } from "./TaskCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import { SortOption, FilterOption } from "../types/kanban";
import { ArrowUpDown, Filter, Edit2, Check, X } from "lucide-react";

interface ListViewProps {
  tasks: Task[];
  columns: Column[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const ListView = ({ tasks, columns, onUpdateTask, onDeleteTask }: ListViewProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Get unique categories from tasks
  const uniqueCategories = Array.from(new Set(tasks.map(task => task.category)));

  const filteredTasks = tasks.filter(task => {
    if (filterBy === 'all') return true;
    if (filterBy === 'column') {
      // Group by column - we'll handle this in the UI
      return true;
    }
    if (filterBy.startsWith('column-')) {
      const columnId = filterBy.replace('column-', '');
      return task.columnId === columnId;
    }
    return task.category === filterBy;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'dueDate':
        const aDate = a.dueDate || new Date(0);
        const bDate = b.dueDate || new Date(0);
        comparison = aDate.getTime() - bDate.getTime();
        break;
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleStartEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleSaveEdit = (taskId: string) => {
    onUpdateTask(taskId, {
      title: editTitle,
      description: editDescription
    });
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[priority];
  };

  const getCategoryColor = (category: string) => {
    // Generate consistent colors for custom categories
    const colors = [
      'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    ];
    const hash = category.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getColumnTitle = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    return column?.title || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Task List
        </h2>
        <div className="flex gap-3">
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              {columns.map((column) => (
                <SelectItem key={column.id} value={`column-${column.id}`}>
                  {column.title}
                </SelectItem>
              ))}
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  Category: {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={toggleSortOrder}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {sortedTasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingTask === task.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="font-medium"
                          placeholder="Task title"
                        />
                        <Button size="sm" onClick={() => handleSaveEdit(task.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Task description"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                          {task.title}
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(task)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {task.description}
                        </p>
                      )}
                    </>
                  )}
                  
                  {editingTask !== task.id && (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {getColumnTitle(task.columnId)}
                      </Badge>
                      <Badge variant="secondary" className={getCategoryColor(task.category)}>
                        {task.category}
                      </Badge>
                      <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                        {task.priority} priority
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="outline">
                          Due: {format(task.dueDate, 'MMM d, yyyy')}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {editingTask !== task.id && (
                  <div className="flex-shrink-0">
                    <TaskCard
                      task={task}
                      onUpdate={(updates) => onUpdateTask(task.id, updates)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          {sortedTasks.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No tasks found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
