// src/store/useTaskStore.ts

import { Task, TaskPriority } from "../core/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Описание фильтров задач:
 * - status: показывать все / выполненные / активные (не выполненные)
 * - priority: приоритет задачи или "all" для любого
 * - dateRange: диапазон по дате дедлайна
 * - search: текстовый поиск по заголовку
 */
interface TaskFilters {
  status: "all" | "completed" | "active";
  priority: TaskPriority | "all";
  dateRange: "all" | "today" | "week" | "month" | "overdue";
  search: string;
}

/**
 * Интерфейс Zustand‑стора задач, объединяющий:
 * - массив задач
 * - текущие фильтры
 * - CRUD‑методы по задачам
 * - методы управления редактированием
 */
interface TaskStore {
  tasks: Task[];                           // список всех задач
  filters: TaskFilters;                    // параметры активной фильтрации

  /** Добавляет новую задачу в конец массива */
  addTask: (task: Task) => void;

  /** Удаляет задачу по её id */
  removeTask: (id: string) => void;

  /** Переключает флаг completed у указанной задачи */
  toggleCompleted: (id: string) => void;

  /** Обновляет сразу несколько параметров фильтра */
  setFilters: (filters: Partial<TaskFilters>) => void;

  /** Сбрасывает все фильтры к значениям по умолчанию */
  resetFilters: () => void;

  /** Задача, выбранная для редактирования (или null) */
  taskToEdit: Task | null;

  /** Устанавливает задачу, которую нужно отредактировать */
  setTaskToEdit: (task: Task | null) => void;

  /** Очищает выбор редактируемой задачи */
  clearTaskToEdit: () => void;

  /** Применяет обновлённый объект задачи к списку */
  updateTask: (task: Task) => void;
}

/**
 * Хук useTaskStore организует:
 * - состояние задач + фильтры
 * - методы для работы с ними
 * Сохраняет в localStorage под ключом "task-store" (persist middleware).
 */
export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      // --- Начальное состояние ---
      tasks: [],                                            // пустой список задач
      filters: {
        status: "all",
        priority: "all",
        dateRange: "all",
        search: "",
      },
      taskToEdit: null,                                     // пока нет выбранной задачи

      // --- Методы управления задачами ---
      addTask: (task) =>
        set((state) => ({
          // добавляем задачу в конец массива, не мутируя старый
          tasks: [...state.tasks, task],
        })),

      removeTask: (id) =>
        set((state) => ({
          // отфильтровываем весь массив, исключая задачу с данным id
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleCompleted: (id) =>
        set((state) => ({
          // пробегаемся по списку и для совпадающего id меняем completed
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),

      updateTask: (updatedTask) =>
        set((state) => ({
          // заменяем старую задачу на новую по совпадению id
          tasks: state.tasks.map((task) =>
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          ),
        })),

      // --- Методы управления фильтрами ---
      setFilters: (filters) =>
        set((state) => ({
          // сливаем новое значение фильтров с предыдущими
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () =>
        set(() => ({
          // возвращаем фильтры в дефолтное состояние
          filters: {
            status: "all",
            priority: "all",
            dateRange: "all",
            search: "",
          },
        })),

      // --- Методы для работы с редактированием ---
      setTaskToEdit: (task) => set({ taskToEdit: task }),   // выбираем задачу
      clearTaskToEdit: () => set({ taskToEdit: null }),     // сбрасываем выбор
    }),
    {
      name: "task-store", // ключ в localStorage
      // По умолчанию хранится весь state: tasks и filters
      
    }
  )
);
