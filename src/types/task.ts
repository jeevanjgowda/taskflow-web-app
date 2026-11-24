export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string | null;
  is_completed?: boolean;
}

export type SidebarView = 'dashboard' | 'all' | 'pending' | 'completed';

export type PriorityFilter = 'All' | TaskPriority;

export type StatusFilter = 'All' | 'Pending' | 'Completed' | 'Overdue';

export type SortOption =
  | 'created_desc'
  | 'created_asc'
  | 'due_asc'
  | 'due_desc';
