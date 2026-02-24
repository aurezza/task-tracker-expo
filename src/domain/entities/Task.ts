export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  category_id?: string;
  deadline?: string;
  created_at: string;
}
