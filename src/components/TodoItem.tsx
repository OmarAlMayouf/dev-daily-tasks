import { Todo, TodoTag, TAG_LABELS, NEXT_STATUS } from '@/types/todo';
import { Check, Circle, Loader2, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { PriorityIcon } from './PriorityIcon';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { TaskModal } from './TaskModal';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: Todo['status']) => boolean;
  canStartDoing: boolean;
  isDragging?: boolean;
}

export const TodoItem = forwardRef<HTMLDivElement, TodoItemProps>(({ 
  todo, onUpdate, onDelete, onMove, canStartDoing, isDragging 
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { settings, getTagLabel, getTagColor } = useSettingsContext();

  const handleStatusClick = () => {
    const nextStatus = NEXT_STATUS[todo.status];
    if (nextStatus) {
      if (nextStatus === 'doing' && !canStartDoing) {
        return;
      }
      onMove(todo.id, nextStatus);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(todo.id);
    setShowDeleteConfirm(false);
  };

  const StatusIcon = {
    todo: Circle,
    doing: Loader2,
    done: Check,
  }[todo.status];

  const statusClasses = {
    todo: 'status-todo hover:text-status-doing',
    doing: 'status-doing',
    done: 'status-done',
  }[todo.status];

  const canMoveForward = NEXT_STATUS[todo.status] !== null && 
    !(NEXT_STATUS[todo.status] === 'doing' && !canStartDoing);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "group rounded-lg border bg-card p-3 transition-all animate-fade-in cursor-pointer",
          todo.status === 'done' && "opacity-60",
          "hover:border-muted-foreground/30",
          isDragging && "shadow-lg ring-2 ring-primary"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 p-1 text-muted-foreground/40 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </div>

          {/* Status button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusClick();
            }}
            disabled={!canMoveForward}
            className={cn(
              "mt-0.5 p-1 rounded transition-colors",
              statusClasses,
              !canMoveForward && "opacity-50 cursor-not-allowed"
            )}
            title={
              todo.status === 'todo' 
                ? canStartDoing ? 'Start working' : `Doing limit reached (max ${settings.doingLimit})`
                : todo.status === 'doing' 
                  ? 'Mark as done' 
                  : 'Completed'
            }
          >
            <StatusIcon 
              size={18} 
              className={cn(todo.status === 'doing' && "animate-spin")}
              style={{ animationDuration: '3s' }}
            />
          </button>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <div
              className={cn(
                "font-mono text-sm w-full truncate",
                todo.status === 'done' && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Priority */}
              {todo.priority && (
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1",
                  `priority-${todo.priority}`
                )}>
                  <PriorityIcon priority={todo.priority} size={12} />
                  {todo.priority}
                </span>
              )}

              {/* Tags */}
              {todo.tags.map((tag) => {
                const isCustom = settings.customTags.some(t => t.id === tag);
                const tagColor = getTagColor(tag);
                const tagLabel = getTagLabel(tag);
                
                return (
                  <span
                    key={tag}
                    className={cn(
                      "text-xs font-mono px-1.5 py-0.5 rounded border",
                      !isCustom && `tag-${tag}`
                    )}
                    style={
                      isCustom
                        ? {
                            backgroundColor: `hsl(${tagColor} / 0.15)`,
                            color: `hsl(${tagColor})`,
                            borderColor: `hsl(${tagColor} / 0.3)`,
                          }
                        : undefined
                    }
                  >
                    {isCustom ? tagLabel : TAG_LABELS[tag as keyof typeof TAG_LABELS]}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {(todo.notes || todo.tags.length > 0 || todo.priority) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
              className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            {/* Notes */}
            {todo.notes && (
              <pre 
                className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words overflow-hidden"
              >
                {todo.notes}
              </pre>
            )}
          </div>
        )}
      </div>

      <TaskModal
        todo={todo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onUpdate}
      />

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title={todo.title}
      />
    </>
  );
});

TodoItem.displayName = 'TodoItem';
