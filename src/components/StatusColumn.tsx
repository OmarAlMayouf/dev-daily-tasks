import { Todo, TodoStatus, STATUS_LABELS, NEXT_STATUS } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { cn } from '@/lib/utils';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface StatusColumnProps {
  status: TodoStatus;
  todos: Todo[];
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TodoStatus) => boolean;
  canStartDoing: boolean;
  doingCount: number;
}

export function StatusColumn({ 
  status, 
  todos, 
  onUpdate, 
  onDelete, 
  onMove, 
  canStartDoing,
  doingCount 
}: StatusColumnProps) {
  const { settings } = useSettingsContext();
  
  const statusColors = {
    todo: 'status-todo',
    doing: 'status-doing',
    done: 'status-done',
  };

  // Determine which statuses can drop onto this column
  // Only previous status can drop here (todo->doing, doing->done)
  const getAcceptedStatuses = (): TodoStatus[] => {
    if (status === 'doing') return ['todo'];
    if (status === 'done') return ['doing'];
    return [];
  };

  const acceptedStatuses = getAcceptedStatuses();

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className={cn("w-2 h-2 rounded-full bg-current", statusColors[status])} />
        <h2 className="font-medium text-sm">{STATUS_LABELS[status]}</h2>
        <span className="text-xs text-muted-foreground font-mono">
          {todos.length}
          {status === 'doing' && (
            <span className="text-muted-foreground/60">/{settings.doingLimit}</span>
          )}
        </span>
        {status === 'doing' && doingCount >= settings.doingLimit && (
          <span className="text-xs text-status-doing ml-auto">limit reached</span>
        )}
      </div>

      {/* Todo list with droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex flex-col gap-2 min-h-[100px] rounded-lg transition-colors p-1 -m-1",
              snapshot.isDraggingOver && "bg-primary/5 ring-1 ring-primary/20"
            )}
          >
            {todos.length === 0 && !snapshot.isDraggingOver ? (
              <p className="text-xs text-muted-foreground/60 font-mono py-4 text-center">
                {status === 'todo' && '// nothing queued'}
                {status === 'doing' && '// pick something to work on'}
                {status === 'done' && '// ship it 🚀'}
              </p>
            ) : (
              todos.map((todo, index) => (
                <Draggable key={todo.id} draggableId={todo.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TodoItem
                        todo={todo}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onMove={onMove}
                        canStartDoing={canStartDoing}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
