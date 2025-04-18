import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Возможные значения для фильтра статуса:
 * - 'all' — все задачи
 * - 'completed' — только выполненные
 * - 'uncompleted' — только невыполненные
 */
type StatusFilter = 'all' | 'completed' | 'uncompleted';

/**
 * Приоритеты задач (массив), можно выбирать несколько одновременно:
 * - 'low' — низкий
 * - 'medium' — средний
 * - 'high' — высокий
 */
type PriorityFilter = ('low' | 'medium' | 'high')[];

/**
 * Диапазоны дат для фильтрации:
 * - 'all' — без ограничения
 * - 'today' — задачи на сегодня
 * - 'week' — задачи на текущую неделю
 * - 'month' — задачи на текущий месяц
 * - 'overdue' — просроченные задачи
 */
type DateRangeFilter = 'all' | 'today' | 'week' | 'month' | 'overdue';

/**
 * Интерфейс состояния фильтров.
 * Хранит текущие значения фильтров и методы для их обновления/сброса.
 */
interface FilterState {
  status: StatusFilter;            // текущий фильтр по статусу задач
  priority: PriorityFilter;        // текущий фильтр по приоритету задач
  dateRange: DateRangeFilter;      // текущий фильтр по диапазону дат
  search: string;                  // текстовый фильтр (поиск по названию)
  tags: string[];                  // фильтр по тегам задач

  // Методы для обновления каждого поля фильтра:
  setStatus: (status: StatusFilter) => void;
  setPriority: (priority: PriorityFilter) => void;
  setDateRange: (range: DateRangeFilter) => void;
  setSearch: (text: string) => void;
  setTags: (tags: string[]) => void;

  // Сбрасывает все фильтры к значениям по умолчанию
  resetFilters: () => void;
}

/**
 * Создаём Zustand‑стор для фильтров с middleware `persist`,
 * который автоматически сохраняет и восстанавливает состояние из localStorage.
 */
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      // --- Начальные (дефолтные) значения фильтров ---
      status: 'all',
      priority: [],
      dateRange: 'all',
      search: '',
      tags: [],

      // --- Сеттеры для обновления части состояния ---
      setStatus: (status) => set({ status }),
      setPriority: (priority) => set({ priority }),
      setDateRange: (dateRange) => set({ dateRange }),

      /**
       * При обновлении текстового поиска ,
       * а затем сохраняем новое значение в стор.
       */
      setSearch: (search) => {
    
        set({ search });
      },

      setTags: (tags) => set({ tags }),

      /**
       * Сбрасывает все фильтры к изначальным значениям.
       * После вызова все фильтры: статус, приоритет, дата, поиск и теги
       * вернутся к 'all' / [] / ''.
       */
      resetFilters: () =>
        set({
          status: 'all',
          priority: [],
          dateRange: 'all',
          search: '',
          tags: [],
        }),
    }),
    {
      name: 'task-manager-filters',                  // ключ в localStorage
      storage: createJSONStorage(() => localStorage), // используем стандартный localStorage

    }
  )
);
