import { useState, useEffect } from 'react';
import { Filter, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface TagFilterProps {
  selectedTags: string[];
  onApply: (tags: string[]) => void;
}

export const TagFilter = ({ selectedTags, onApply }: TagFilterProps) => {
  const { settings, getTagLabel, getTagColor } = useSettingsContext();
  const [open, setOpen] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>(selectedTags);

  // Get all available tags
  const availableTags = [
    ...settings.enabledDefaultTags,
    ...settings.customTags.map(t => t.id),
  ];

  // Update temp selection when selectedTags prop changes
  useEffect(() => {
    setTempSelectedTags(selectedTags);
  }, [selectedTags]);

  const toggleTag = (tag: string) => {
    setTempSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApply = () => {
    onApply(tempSelectedTags);
    setOpen(false);
  };

  const handleClear = () => {
    setTempSelectedTags([]);
  };

  const isAllSelected = tempSelectedTags.length === 0;
  const displayText = isAllSelected 
    ? 'All Tags' 
    : `${tempSelectedTags.length} tag${tempSelectedTags.length > 1 ? 's' : ''}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start font-mono"
        >
          <Filter size={16} className="mr-2" />
          <span className="flex-1 text-left">{displayText}</span>
          {!isAllSelected && (
            <Badge variant="secondary" className="ml-2">
              {tempSelectedTags.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Filter by Tags</span>
            {tempSelectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-auto py-1 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto p-2">
          <div className="space-y-1">
            {availableTags.map((tag) => {
              const isSelected = tempSelectedTags.includes(tag);
              const isCustom = settings.customTags.some(t => t.id === tag);
              const tagColor = getTagColor(tag);
              const tagLabel = getTagLabel(tag);

              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    isSelected ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}>
                    {isSelected && <Check size={12} className="text-primary-foreground" />}
                  </div>
                  
                  <span
                    className={cn(
                      "font-mono text-xs px-1.5 py-0.5 rounded border flex-1 text-left",
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
                    {tagLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t bg-muted/30">
          <Button
            onClick={handleApply}
            className="w-full"
            size="sm"
          >
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
