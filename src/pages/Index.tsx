import { useTodos } from '@/hooks/useTodos';
import { TodoForm } from '@/components/TodoForm';
import { StatusColumn } from '@/components/StatusColumn';
import { TrashView } from '@/components/TrashView';
import { TagFilter } from '@/components/TagFilter';
import { TodoStatus, NEXT_STATUS, TodoTag } from '@/types/todo';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid, Crosshair, Terminal, Trash2, Settings, Search } from 'lucide-react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { Input } from '@/components/ui/input';

type ViewMode = 'all' | 'focus' | 'trash';

const Index = () => {
  const { 
    todos,
    trash,
    addTodo, 
    updateTodo, 
    deleteTodo,
    restoreTodo,
    permanentlyDeleteTodo,
    clearTrash,
    moveTodo, 
    canStartDoing, 
    getTodosByStatus,
    getDoingCount,
    reorderTodos,
  } = useTodos();

  const { settings, getTagLabel } = useSettingsContext();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all available tags
  const availableTags = useMemo(() => [
    ...settings.enabledDefaultTags,
    ...settings.customTags.map(t => t.id),
  ], [settings.enabledDefaultTags, settings.customTags]);

  // Filter todos based on search and tag
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // Search filter
      const matchesSearch = searchQuery.trim() === '' || 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Tag filter - if no tags selected, show all
      const matchesTag = selectedTags.length === 0 || 
        todo.tags.some(tag => selectedTags.includes(tag));
      
      return matchesSearch && matchesTag;
    });
  }, [todos, searchQuery, selectedTags]);

  const todoItems = filteredTodos.filter(t => t.status === 'todo');
  const doingItems = filteredTodos.filter(t => t.status === 'doing');
  const doneItems = filteredTodos.filter(t => t.status === 'done');
  const doingCount = getDoingCount();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceStatus = source.droppableId as TodoStatus;
    const destStatus = destination.droppableId as TodoStatus;

    // Check if it's a move between columns
    if (sourceStatus !== destStatus) {
      // Allow moving forward or backward
      // Check doing limit only when moving TO doing column
      if (destStatus === 'doing' && doingCount >= settings.doingLimit) {
        toast.error(`Doing limit reached (max ${settings.doingLimit})`);
        return;
      }

      moveTodo(draggableId, destStatus);
    } else {
      // Reordering within the same column
      const columnTodos = sourceStatus === 'todo' ? [...todoItems] :
                          sourceStatus === 'doing' ? [...doingItems] : [...doneItems];
      
      const [removed] = columnTodos.splice(source.index, 1);
      columnTodos.splice(destination.index, 0, removed);

      // Update the full todos array with new order
      const otherTodos = todos.filter(t => t.status !== sourceStatus);
      reorderTodos([...columnTodos, ...otherTodos]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setViewMode('all')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Terminal size={24} className="text-primary" />
            <h1 className="font-mono font-semibold text-lg">devtodo</h1>
          </button>
          
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('all')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  viewMode === 'all' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid size={14} />
                All
              </button>
              <button
                onClick={() => setViewMode('focus')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  viewMode === 'focus' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Crosshair size={14} />
                Focus
                {doingCount > 0 && (
                  <span className="text-xs bg-status-doing/20 text-status-doing px-1.5 py-0.5 rounded-full font-mono">
                    {doingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('trash')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  viewMode === 'trash' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Trash2 size={14} />
                Trash
                {trash.length > 0 && (
                  <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-mono">
                    {trash.length}
                  </span>
                )}
              </button>
            </div>

            {/* Settings button */}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {viewMode === 'all' ? (
          <>
            {/* Add new todo */}
            <div className="mb-6">
              <TodoForm onAdd={addTodo} />
            </div>

            {/* Search and Filter Row */}
            <div className="mb-6 flex gap-3">
              {/* Search - 75% width */}
              <div className="flex-[3] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  placeholder="Search tasks by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-mono"
                />
              </div>

              {/* Filter - 25% width */}
              <div className="flex-1">
                <TagFilter 
                  selectedTags={selectedTags}
                  onApply={setSelectedTags}
                />
              </div>
            </div>

            {/* Doing limit warning */}
            {doingCount >= settings.doingLimit && (
              <div className="mb-6 p-3 rounded-lg border border-status-doing/30 bg-status-doing/5 text-sm">
                <span className="status-doing font-medium">Heads up:</span>{' '}
                <span className="text-muted-foreground">
                  You've hit the limit of {settings.doingLimit} active tasks. Finish something before starting new work.
                </span>
              </div>
            )}

            {/* Status columns with drag and drop */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid gap-6 md:grid-cols-3">
                <StatusColumn
                  status="todo"
                  todos={todoItems}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                  onMove={moveTodo}
                  canStartDoing={canStartDoing()}
                  doingCount={doingCount}
                />
                <StatusColumn
                  status="doing"
                  todos={doingItems}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                  onMove={moveTodo}
                  canStartDoing={canStartDoing()}
                  doingCount={doingCount}
                />
                <StatusColumn
                  status="done"
                  todos={doneItems}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                  onMove={moveTodo}
                  canStartDoing={canStartDoing()}
                  doingCount={doingCount}
                />
              </div>
            </DragDropContext>
          </>
        ) : viewMode === 'focus' ? (
          /* Focus View */
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Focus Mode</h2>
              <p className="text-muted-foreground text-sm">
                {doingCount === 0 
                  ? "Nothing in progress. Pick a task to focus on."
                  : `You have ${doingCount} task${doingCount > 1 ? 's' : ''} in progress.`
                }
              </p>
            </div>

            {doingCount === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-mono text-sm mb-4">// no active tasks</p>
                <button
                  onClick={() => setViewMode('all')}
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Switch to All view to pick a task →
                </button>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <StatusColumn
                  status="doing"
                  todos={doingItems}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                  onMove={moveTodo}
                  canStartDoing={canStartDoing()}
                  doingCount={doingCount}
                />
              </DragDropContext>
            )}

            {/* Quick stats */}
            <div className="mt-12 pt-6 border-t border-border">
              <div className="flex justify-center gap-8 text-sm">
                <div className="text-center">
                  <div className="font-mono text-2xl text-muted-foreground">{todoItems.length}</div>
                  <div className="text-xs text-muted-foreground/60">queued</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl text-status-doing">{doingCount}</div>
                  <div className="text-xs text-muted-foreground/60">in progress</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl text-status-done">{doneItems.length}</div>
                  <div className="text-xs text-muted-foreground/60">completed</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Trash View */
          <TrashView
            trash={trash}
            onRestore={restoreTodo}
            onPermanentDelete={permanentlyDeleteTodo}
            onClearTrash={clearTrash}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground/60">
            <div className="flex items-center gap-4">
              <span><kbd className="kbd">n</kbd> new todo</span>
              <span><kbd className="kbd">esc</kbd> close form</span>
            </div>
            <span className="font-mono">// built for devs</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
