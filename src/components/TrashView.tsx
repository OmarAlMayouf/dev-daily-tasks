import { Todo, TAG_LABELS, PRIORITY_LABELS } from '@/types/todo';
import { Undo2, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityIcon } from './PriorityIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TrashViewProps {
  trash: Todo[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onClearTrash: () => void;
}

export function TrashView({ trash, onRestore, onPermanentDelete, onClearTrash }: TrashViewProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Trash</h2>
          <p className="text-muted-foreground text-sm">
            {trash.length === 0 
              ? "Trash is empty" 
              : `${trash.length} item${trash.length > 1 ? 's' : ''} in trash`
            }
          </p>
        </div>
        {trash.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors">
                <Trash2 size={16} />
                Empty Trash
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive" size={20} />
                  Empty Trash?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {trash.length} item{trash.length > 1 ? 's' : ''} in trash. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearTrash} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Empty Trash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {trash.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="mx-auto mb-4 text-muted-foreground/40" size={48} />
          <p className="text-muted-foreground font-mono text-sm">// nothing in trash</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trash.map((todo) => (
            <div 
              key={todo.id}
              className="group rounded-lg border bg-card p-3 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {todo.priority && <PriorityIcon priority={todo.priority} />}
                    <span className="font-mono text-sm line-through text-muted-foreground">
                      {todo.title}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {todo.priority && (
                      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", `priority-${todo.priority}`)}>
                        {PRIORITY_LABELS[todo.priority]}
                      </span>
                    )}
                    {todo.tags.map((tag) => (
                      <span key={tag} className={cn("text-xs font-mono px-1.5 py-0.5 rounded border", `tag-${tag}`)}>
                        {TAG_LABELS[tag]}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground/60">
                      Deleted {formatDate(todo.deletedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRestore(todo.id)}
                    className="p-1.5 text-muted-foreground hover:text-primary rounded transition-colors"
                    title="Restore"
                  >
                    <Undo2 size={16} />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <span className="font-mono text-foreground">"{todo.title}"</span> will be permanently deleted. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onPermanentDelete(todo.id)} 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
