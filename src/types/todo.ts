export type TodoStatus = 'todo' | 'doing' | 'done';
export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoTag = 'bug' | 'feature' | 'refactor' | 'infra' | 'docs';

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  priority?: TodoPriority;
  tags: TodoTag[];
  notes?: string;
  createdAt: number;
  completedAt?: number;
  deletedAt?: number;
}

export const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: 'Todo',
  doing: 'Doing',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const TAG_LABELS: Record<TodoTag, string> = {
  bug: 'bug',
  feature: 'feature',
  refactor: 'refactor',
  infra: 'infra',
  docs: 'docs',
};

export const ALL_TAGS: TodoTag[] = ['bug', 'feature', 'refactor', 'infra', 'docs'];
export const ALL_PRIORITIES: TodoPriority[] = ['low', 'medium', 'high'];
export const DOING_LIMIT = 3;

// Status flow: todo -> doing -> done
export const NEXT_STATUS: Record<TodoStatus, TodoStatus | null> = {
  todo: 'doing',
  doing: 'done',
  done: null,
};

export const PREV_STATUS: Record<TodoStatus, TodoStatus | null> = {
  todo: null,
  doing: 'todo',
  done: 'doing',
};
