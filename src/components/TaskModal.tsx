import { useState, useEffect } from 'react';
import { Todo, TodoStatus, TodoPriority, TodoTag } from '@/types/todo';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityIcon } from './PriorityIcon';

interface TaskModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Todo>) => void;
}

export const TaskModal = ({ todo, isOpen, onClose, onSave }: TaskModalProps) => {
  const { settings, getTagLabel, getTagColor } = useSettingsContext();
  
  // Get all available tags (enabled defaults + custom)
  const availableTags = [
    ...settings.enabledDefaultTags,
    ...settings.customTags.map(t => t.id),
  ];

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [selectedTags, setSelectedTags] = useState<TodoTag[]>([]);
  const [notes, setNotes] = useState('');

  // Update state when todo changes
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setStatus(todo.status);
      setPriority(todo.priority);
      setSelectedTags(todo.tags || []);
      setNotes(todo.notes || '');
    }
  }, [todo]);

  const handleSave = () => {
    if (!todo || !title.trim()) return;

    onSave(todo.id, {
      title: title.trim(),
      status,
      priority,
      tags: selectedTags,
      notes: notes.trim(),
    });

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const toggleTag = (tagValue: TodoTag) => {
    setSelectedTags(prev =>
      prev.includes(tagValue)
        ? prev.filter(t => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  if (!todo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>

          {/* Status and Priority in a row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as TodoStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="doing">Doing</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TodoPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <PriorityIcon priority="high" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <PriorityIcon priority="medium" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <PriorityIcon priority="low" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag as TodoTag);
                const color = getTagColor(tag);
                const label = getTagLabel(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer ${isSelected ? `!border-current` : ''}`}
                    style={isSelected ? { 
                      backgroundColor: color ? `hsl(${color})` : undefined,
                      borderColor: color ? `hsl(${color})` : undefined,
                      color: 'white'
                    } : {}}
                    onClick={() => toggleTag(tag as TodoTag)}
                  >
                    {label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="min-h-[120px] resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
