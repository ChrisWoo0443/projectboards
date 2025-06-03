import { useState } from "react";
import { Task } from "../types/kanban";
import { Badge } from "../components/ui/badge";
import { format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameMonth } from "date-fns";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { EditTask } from "./EditTask";

interface CalendarViewProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const CalendarView = ({ tasks, onUpdateTask }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => task.dueDate && isSameDay(task.dueDate, date));
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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    
    if (destination.droppableId === source.droppableId) return;

    const newDate = new Date(destination.droppableId);
    onUpdateTask(draggableId, { dueDate: newDate });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    const days = direction === 'prev' ? -7 : 7;
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">
            {weekDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Droppable key={day.toISOString()} droppableId={day.toISOString()}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-white dark:bg-slate-800 p-3 min-h-[120px] ${
                        snapshot.isDraggingOver ? 'bg-violet-50 dark:bg-violet-900/20' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isToday 
                          ? 'text-violet-600 dark:text-violet-400' 
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {format(day, 'EEE d')}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setEditingTask(task)}
                                className={`text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-all ${
                                  snapshot.isDragging ? 'rotate-1 scale-105 shadow-lg z-50' : ''
                                } ${getCategoryColor(task.category)}`}
                                style={{
                                  ...provided.draggableProps.style,
                                  transform: snapshot.isDragging 
                                    ? `${provided.draggableProps.style?.transform} rotate(1deg)` 
                                    : provided.draggableProps.style?.transform
                                }}
                              >
                                <div className="font-medium truncate">
                                  {task.title}
                                </div>
                                <div className="text-xs opacity-75">
                                  {task.category}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {format(selectedDate, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-slate-100 dark:bg-slate-700 p-3 text-center">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {day}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700">
            {calendarDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, selectedDate);
              
              return (
                <Droppable key={day.toISOString()} droppableId={day.toISOString()}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-white dark:bg-slate-800 p-2 min-h-[120px] relative ${
                        snapshot.isDraggingOver ? 'bg-violet-50 dark:bg-violet-900/20' : ''
                      } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isToday 
                          ? 'text-violet-600 dark:text-violet-400' 
                          : isCurrentMonth
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setEditingTask(task)}
                                className={`text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-all ${
                                  snapshot.isDragging ? 'rotate-1 scale-105 shadow-lg z-50' : ''
                                } ${getCategoryColor(task.category)}`}
                                style={{
                                  ...provided.draggableProps.style,
                                  transform: snapshot.isDragging 
                                    ? `${provided.draggableProps.style?.transform} rotate(1deg)` 
                                    : provided.draggableProps.style?.transform,
                                  zIndex: snapshot.isDragging ? 1000 : 'auto'
                                }}
                              >
                                <div className="font-medium truncate">
                                  {task.title}
                                </div>
                                <div className="text-xs opacity-75">
                                  {task.category}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Calendar View
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {viewMode === 'month' ? renderMonthView() : renderWeekView()}

      {editingTask && (
        <EditTask
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={(updates) => {
            onUpdateTask(editingTask.id, updates);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};
