import { useSettingsContext } from '@/contexts/SettingsContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Settings as SettingsIcon, Plus, X, Palette, Moon, Sun, Check, ArrowLeft, Save } from 'lucide-react';
import { ALL_TAGS, TAG_LABELS } from '@/types/todo';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PRESET_COLORS = [
  { name: 'Red', value: '0 70% 55%' },
  { name: 'Orange', value: '35 90% 55%' },
  { name: 'Yellow', value: '45 90% 50%' },
  { name: 'Green', value: '140 70% 45%' },
  { name: 'Cyan', value: '175 80% 40%' },
  { name: 'Blue', value: '210 80% 55%' },
  { name: 'Purple', value: '280 60% 55%' },
  { name: 'Pink', value: '330 70% 60%' },
  { name: 'Gray', value: '220 15% 55%' },
];

const Settings = () => {
  const {
    settings,
    addCustomTag,
    removeCustomTag,
    toggleDefaultTag,
    setTheme,
    setColumnLimit,
  } = useSettingsContext();

  const navigate = useNavigate();
  
  // Local state only for doing limit (needs save/cancel)
  const [localDoingLimit, setLocalDoingLimit] = useState(settings.doingLimit);
  const [hasDoingChanges, setHasDoingChanges] = useState(false);
  
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0].value);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Sync local doing limit with settings
  useEffect(() => {
    setLocalDoingLimit(settings.doingLimit);
    setHasDoingChanges(false);
  }, [settings.doingLimit]);

  // Check for doing limit changes
  useEffect(() => {
    setHasDoingChanges(localDoingLimit !== settings.doingLimit);
  }, [localDoingLimit, settings.doingLimit]);

  const handleSaveDoingLimit = () => {
    setColumnLimit('doing', localDoingLimit);
    setHasDoingChanges(false);
    toast.success('Doing limit saved successfully');
  };

  const handleCancelDoingLimit = () => {
    setLocalDoingLimit(settings.doingLimit);
    setHasDoingChanges(false);
    toast.info('Changes discarded');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagLabel.trim()) return;

    addCustomTag(newTagLabel.trim(), newTagColor);
    setNewTagLabel('');
    setNewTagColor(PRESET_COLORS[0].value);
    setShowColorPicker(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Back to todos"
          >
            <ArrowLeft size={20} />
          </button>
          <SettingsIcon size={24} className="text-primary" />
          <h1 className="font-mono font-semibold text-lg">Settings</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Theme Settings */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Palette size={20} className="text-primary" />
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Theme</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors",
                    settings.theme === 'dark'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"
                  )}
                >
                  <Moon size={18} />
                  <span className="flex-1 text-center">Dark</span>
                  {settings.theme === 'dark' && <Check size={16} />}
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors",
                    settings.theme === 'light'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"
                  )}
                >
                  <Sun size={18} />
                  <span className="flex-1 text-center">Light</span>
                  {settings.theme === 'light' && <Check size={16} />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Task Limits */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold text-lg mb-4">Task Limit</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Set maximum number of tasks allowed in the "Doing" column to help you stay focused.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Doing Column Limit</label>
              <input
                type="number"
                min="1"
                max="20"
                value={localDoingLimit}
                onChange={(e) => setLocalDoingLimit(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Current limit: {settings.doingLimit} tasks
              </p>
            </div>

            {/* Save/Cancel for doing limit only */}
            {hasDoingChanges && (
              <div className="flex items-center justify-end gap-3 pt-2 border-t">
                <button
                  onClick={handleCancelDoingLimit}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDoingLimit}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Limit
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Default Tags */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold text-lg mb-4">Default Tags</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Toggle default tags on/off. Disabled tags won't appear when adding or editing tasks.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleDefaultTag(tag)}
                className={cn(
                  "text-sm font-mono px-3 py-1.5 rounded border transition-all",
                  settings.enabledDefaultTags.includes(tag)
                    ? `tag-${tag} !border-current`
                    : "text-muted-foreground border-border opacity-50 hover:opacity-70"
                )}
              >
                {TAG_LABELS[tag]}
                {settings.enabledDefaultTags.includes(tag) && (
                  <Check size={14} className="inline ml-1" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Custom Tags */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold text-lg mb-4">Custom Tags</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create your own custom tags with personalized colors.
          </p>

          {/* Add new tag form */}
          <form onSubmit={handleAddTag} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newTagLabel}
                  onChange={(e) => setNewTagLabel(e.target.value)}
                  placeholder="e.g., design, testing, urgent..."
                  className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-1 focus:ring-primary text-sm font-mono"
                />
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="px-4 py-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
                  title="Choose color"
                >
                  <div 
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: `hsl(${newTagColor})` }}
                  />
                </button>

                {showColorPicker && (
                  <div className="absolute top-full mt-2 right-0 bg-card border rounded-lg shadow-lg p-3 z-10 grid grid-cols-3 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          setNewTagColor(color.value);
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          "w-10 h-10 rounded border-2 transition-all hover:scale-110",
                          newTagColor === color.value ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                        )}
                        style={{ backgroundColor: `hsl(${color.value})` }}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!newTagLabel.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </form>

          {/* Custom tags list */}
          {settings.customTags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm font-mono">
              // no custom tags yet
            </div>
          ) : (
            <div className="space-y-2">
              {settings.customTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: `hsl(${tag.color})` }}
                    />
                    <span 
                      className="text-sm font-mono px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `hsl(${tag.color} / 0.15)`,
                        color: `hsl(${tag.color})`,
                        borderColor: `hsl(${tag.color} / 0.3)`,
                      }}
                    >
                      {tag.label}
                    </span>
                  </div>
                  <button
                    onClick={() => removeCustomTag(tag.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground/60 font-mono">
          Settings are saved automatically
        </div>
      </main>
    </div>
  );
};

export default Settings;
