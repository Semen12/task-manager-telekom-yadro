import React from 'react';
import { Select, Space, Button, Tag } from 'antd';
import { useFilterStore } from '../../storage/useFilterStore';
import { useTaskStore } from '../../storage/useTaskStore';
import TaskSearch from './TaskSearch';

const { Option } = Select;

/**
 * Панель фильтров для списка задач:
 * позволяет настроить фильтрацию по статусу, приоритету, дате, тегам и текстовому поиску.
 */
const TaskFiltersPanel: React.FC = () => {
  // Получаем текущее состояние фильтров и методы для их изменения
  const {
    status,
    priority,
    dateRange,
    tags,
    setStatus,
    setPriority,
    setDateRange,
    setTags,
    resetFilters,
  } = useFilterStore();

  // Получаем все задачи, чтобы динамически собрать список всех доступных тегов
  const tasks = useTaskStore((s) => s.tasks);

  // Уникальные теги из всех задач (используем Set для удаления дубликатов)
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags || [])));

  return (
    <Space wrap style={{ marginBottom: 24 }}>
      {/** Фильтр по статусу задачи */}
      <Select
        value={status}
        onChange={setStatus}
        style={{ width: 140 }}
        placeholder="Статус"
      >
        <Option value="all">Все</Option>
        <Option value="completed">Выполненные</Option>
        <Option value="uncompleted">Невыполненные</Option>
      </Select>

      {/** Фильтр по приоритету: можно выбрать несколько */}
      <Select
        mode="multiple"
        allowClear
        value={priority}
        onChange={setPriority}
        style={{ width: 200 }}
        placeholder="Приоритет"
      >
        <Option value="high">Высокий</Option>
        <Option value="medium">Средний</Option>
        <Option value="low">Низкий</Option>
      </Select>

      {/** Фильтр по диапазону дат дедлайна */}
      <Select
        value={dateRange}
        onChange={setDateRange}
        style={{ width: 180 }}
        placeholder="Дата"
      >
        <Option value="all">Все даты</Option>
        <Option value="today">Сегодня</Option>
        <Option value="week">На неделе</Option>
        <Option value="month">В этом месяце</Option>
        <Option value="overdue">Просроченные</Option>
      </Select>

      {/** Фильтр по тегам: список опций — динамический */}
      <Select
        mode="multiple"
        allowClear
        value={tags}
        onChange={setTags}
        style={{ width: 200 }}
        placeholder="Теги"
      >
        {allTags.map((tag) => (
          <Option key={tag} value={tag}>
            {tag}
          </Option>
        ))}
      </Select>

      {/** Текстовый поиск с debounce внутри TaskSearch */}
      <TaskSearch />

      {/** Кнопка сброса всех фильтров к значениям по умолчанию */}
      <Button onClick={resetFilters}>Очистить фильтры</Button>

      {/** Отображение активных фильтров в виде closable Tag */}
      <Space>
        {status !== 'all' && (
          <Tag closable onClose={() => setStatus('all')}>
            Статус: {status === 'completed' ? 'Выполненные' : 'Невыполненные'}
          </Tag>
        )}

        {/** Показываем один Tag на каждый выбранный приоритет */}
        {priority.map((p) => (
          <Tag
            key={p}
            closable
            onClose={() => setPriority(priority.filter((x) => x !== p))}
          >
            Приоритет: {p}
          </Tag>
        ))}

        {dateRange !== 'all' && (
          <Tag closable onClose={() => setDateRange('all')}>
            Дата:{' '}
            {{
              today: 'Сегодня',
              week: 'На неделе',
              month: 'В этом месяце',
              overdue: 'Просроченные',
            }[dateRange]}
          </Tag>
        )}

        {/** Показываем один Tag на каждый выбранный тег */}
        {tags.map((tag) => (
          <Tag
            key={tag}
            closable
            onClose={() => setTags(tags.filter((t) => t !== tag))}
          >
            Тег: {tag}
          </Tag>
        ))}
      </Space>
    </Space>
  );
};

export default TaskFiltersPanel;
