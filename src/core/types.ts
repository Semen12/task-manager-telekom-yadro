// Типы приоритетов задач: низкий, средний, высокий
export type TaskPriority = 'low' | 'medium' | 'high';

// Основной интерфейс задачи
export interface Task {
  id: string;                 // Уникальный идентификатор задачи (UUID)
  title: string;              // Заголовок задачи / описание действия
  completed: boolean;         // Флаг выполнения задачи
  dueDate: string;            // Дата дедлайна (в формате ISO строки)
  priority: TaskPriority;     // Приоритет задачи
  tags?: string[];            // Необязательный список пользовательских тегов
  createdAt: string;          // Дата и время создания задачи (в формате ISO строки)
}
