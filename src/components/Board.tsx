import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";
import { Task, Column } from "../types/kanban";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";

interface KanbanBoardProps {
  tasks: Task[];
  columns: Column[];
  onMoveTask: (taskId: string, newColumnId: string, newIndex: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: (columnId: string) => void;
  onUpdateColumn: (columnId: string, title: string) => void;
  onMoveColumn: (columnId: string, newIndex: number) => void;
}

export const KanbanBoard = ({ 
  tasks, 
  columns, 
  onMoveTask, 
  onUpdateTask, 
  onDeleteTask,
  onCreateTask,
  onUpdateColumn,
  onMoveColumn
}: KanbanBoardProps) => {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'column') {
      onMoveColumn(draggableId, destination.index);
      return;
    }

    if (type === 'task') {
      onMoveTask(draggableId, destination.droppableId, destination.index);
      return;
    }
  };

  const getColumnTasks = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return [];
    
    return column.taskIds
      .map(taskId => tasks.find(task => task.id === taskId))
      .filter((task): task is Task => task !== undefined);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto pb-4">
        <Droppable droppableId="board" direction="horizontal" type="column">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-6 min-w-fit"
            >
          {columns.map((column, index) => (
            <Draggable key={column.id} draggableId={column.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 w-80 flex-shrink-0"
                >
                  <div className="flex items-center justify-between mb-4" {...provided.dragHandleProps}>
                    <div className="flex items-center gap-2 flex-1">
                      {editingColumnId === column.id ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => {
                            if (editingTitle.trim() && editingTitle !== column.title) {
                              onUpdateColumn(column.id, editingTitle.trim());
                            }
                            setEditingColumnId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editingTitle.trim() && editingTitle !== column.title) {
                              onUpdateColumn(column.id, editingTitle.trim());
                              setEditingColumnId(null);
                            } else if (e.key === 'Escape') {
                              setEditingColumnId(null);
                            }
                          }}
                          className="h-7 px-2"
                          autoFocus
                        />
                      ) : (
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {column.title}
                          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs px-2 py-1 rounded-full">
                            {getColumnTasks(column.id).length}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-500 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => {
                              setEditingColumnId(column.id);
                              setEditingTitle(column.title);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </h3>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCreateTask(column.id)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Droppable droppableId={column.id} type="task">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] space-y-3 transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'bg-violet-50 dark:bg-violet-900/20 rounded-lg p-2' 
                            : ''
                        }`}
                      >
                        {getColumnTasks(column.id).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-transform ${
                                  snapshot.isDragging ? 'rotate-3 scale-105' : ''
                                }`}
                              >
                                <TaskCard
                                  task={task}
                                  onUpdate={(updates) => onUpdateTask(task.id, updates)}
                                  onDelete={() => onDeleteTask(task.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
</DragDropContext>
  );
};
