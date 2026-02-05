import { useState, useRef, useEffect } from 'react';
import { Todo, TodoPriority, TodoTag, ALL_TAGS, ALL_PRIORITIES, TAG_LABELS, PRIORITY_LABELS } from '@/types/todo';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface TodoFormProps {
  onAdd: (title: string, options?: Partial<Omit<Todo, 'id' | 'title' | 'createdAt'>>) => void;
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TodoPriority | undefined>();
  const [tags, setTags] = useState<TodoTag[]>([]);
  const [notes, setNotes] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings, getTagLabel, getTagColor } = useSettingsContext();

  // Get all available tags (enabled defaults + custom)
  const availableTags = [
    ...settings.enabledDefaultTags,
    ...settings.customTags.map(t => t.id),
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 'n' to open new todo (when not in input)
      if (e.key === 'n' && !isOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd(title.trim(), {
      priority,
      tags,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setPriority(undefined);
    setTags([]);
    setNotes('');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTitle('');
    setPriority(undefined);
    setTags([]);
    setNotes('');
  };

  const toggleTag = (tag: TodoTag) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors group"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
        <span className="font-mono text-sm">new todo</span>
        <kbd className="kbd ml-auto">n</kbd>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Fix auth redirect bug..."
          className="flex-1 bg-transparent border-none outline-none font-mono text-sm placeholder:text-muted-foreground/50"
        />
        <button
          type="button"
          onClick={handleClose}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Priority */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs text-muted-foreground mr-1">priority:</span>
        {ALL_PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(priority === p ? undefined : p)}
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded border transition-colors",
              priority === p 
                ? `priority-${p} border-current` 
                : "text-muted-foreground border-border hover:border-muted-foreground"
            )}
          >
            {PRIORITY_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs text-muted-foreground mr-1">tags:</span>
        {availableTags.map((tag) => {
          const isCustom = settings.customTags.some(t => t.id === tag);
          const tagColor = getTagColor(tag);
          const tagLabel = getTagLabel(tag);
          
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag as TodoTag)}
              className={cn(
                "text-xs font-mono px-2 py-0.5 rounded border transition-colors",
                tags.includes(tag as TodoTag)
                  ? isCustom
                    ? "!border-current"
                    : `tag-${tag} !border-current`
                  : "text-muted-foreground border-border hover:border-muted-foreground"
              )}
              style={
                isCustom && tags.includes(tag as TodoTag)
                  ? {
                      backgroundColor: `hsl(${tagColor} / 0.15)`,
                      color: `hsl(${tagColor})`,
                      borderColor: `hsl(${tagColor})`,
                    }
                  : isCustom
                    ? {}
                    : undefined
              }
            >
              {isCustom ? tagLabel : TAG_LABELS[tag as keyof typeof TAG_LABELS]}
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="notes, stack traces, context..."
        className="w-full bg-secondary/50 rounded p-2 text-xs font-mono resize-none min-h-[60px] outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          <kbd className="kbd">Enter</kbd> to save
        </span>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          Add Todo
        </button>
      </div>
    </form>
  );
}
