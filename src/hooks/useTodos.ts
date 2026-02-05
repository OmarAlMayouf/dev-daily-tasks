import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoStatus } from '@/types/todo';
import { useSettingsContext } from '@/contexts/SettingsContext';

const STORAGE_KEY = 'dev-todos';
const TRASH_STORAGE_KEY = 'dev-todos-trash';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const loadTodos = (): Todo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTodos = (todos: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const loadTrash = (): Todo[] => {
  try {
    const stored = localStorage.getItem(TRASH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTrash = (trash: Todo[]): void => {
  localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
};

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [trash, setTrash] = useState<Todo[]>(loadTrash);
  const { settings } = useSettingsContext();

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    saveTrash(trash);
  }, [trash]);

  const addTodo = useCallback((title: string, options?: Partial<Omit<Todo, 'id' | 'title' | 'createdAt'>>) => {
    const newTodo: Todo = {
      id: generateId(),
      title,
      status: 'todo',
      tags: [],
      createdAt: Date.now(),
      ...options,
    };
    setTodos(prev => [newTodo, ...prev]);
    return newTodo;
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    setTodos(prev => prev.map(todo => {
      if (todo.id !== id) return todo;
      
      const updated = { ...todo, ...updates };
      
      // Set completedAt when marking as done
      if (updates.status === 'done' && todo.status !== 'done') {
        updated.completedAt = Date.now();
      } else if (updates.status && updates.status !== 'done') {
        updated.completedAt = undefined;
      }
      
      return updated;
    }));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (todoToDelete) {
      setTrash(prev => [{ ...todoToDelete, deletedAt: Date.now() }, ...prev]);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }
  }, [todos]);

  const restoreTodo = useCallback((id: string) => {
    const todoToRestore = trash.find(t => t.id === id);
    if (todoToRestore) {
      const { deletedAt, ...restoredTodo } = todoToRestore;
      setTodos(prev => [restoredTodo, ...prev]);
      setTrash(prev => prev.filter(t => t.id !== id));
    }
  }, [trash]);

  const permanentlyDeleteTodo = useCallback((id: string) => {
    setTrash(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearTrash = useCallback(() => {
    setTrash([]);
  }, []);

  const canStartDoing = useCallback(() => {
    const doingCount = todos.filter(t => t.status === 'doing').length;
    return doingCount < settings.doingLimit;
  }, [todos, settings.doingLimit]);

  const moveTodo = useCallback((id: string, newStatus: TodoStatus): boolean => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return false;

    // Check doing limit
    if (newStatus === 'doing' && todo.status !== 'doing') {
      const doingCount = todos.filter(t => t.status === 'doing').length;
      if (doingCount >= settings.doingLimit) {
        return false;
      }
    }

    updateTodo(id, { status: newStatus });
    return true;
  }, [todos, updateTodo, settings.doingLimit]);

  const getTodosByStatus = useCallback((status: TodoStatus): Todo[] => {
    return todos
      .filter(t => t.status === status)
      .sort((a, b) => {
        // Sort by priority (high first) then by creation date
        const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
        const aPriority = priorityOrder[a.priority ?? 'undefined'];
        const bPriority = priorityOrder[b.priority ?? 'undefined'];
        if (aPriority !== bPriority) return aPriority - bPriority;
        return b.createdAt - a.createdAt;
      });
  }, [todos]);

  const getDoingCount = useCallback(() => {
    return todos.filter(t => t.status === 'doing').length;
  }, [todos]);

  const reorderTodos = useCallback((reorderedTodos: Todo[]) => {
    setTodos(reorderedTodos);
  }, []);

  return {
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
  };
}
