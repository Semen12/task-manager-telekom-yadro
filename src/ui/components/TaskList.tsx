
import React, { useState } from 'react';
import {
  List,
  Button,
  Tag,
  Typography,
  Space,
  Tooltip,
  Checkbox,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useTaskStore } from '../../storage/useTaskStore';
import { useFilterStore } from '../../storage/useFilterStore';
import { Task } from '../../core/types';
import dayjs from 'dayjs';
import EditTaskModal from './EditTaskModal';

const { Text } = Typography;

/**
 * Компонент списка задач с учётом фильтров:
 * статус, приоритет, диапазон дат, поиск и теги.
 */
const TaskList: React.FC = () => {
  // --- Получаем всё из стора задач ---
  const tasks = useTaskStore((s) => s.tasks);
  const removeTask = useTaskStore((s) => s.removeTask);
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);

  // --- Получаем значения фильтров из стора фильтров ---
  const statusFilter = useFilterStore((s) => s.status);
  const priorityFilter = useFilterStore((s) => s.priority);
  const dateRange = useFilterStore((s) => s.dateRange);
  const searchText = useFilterStore((s) => s.search);
  const tagFilter = useFilterStore((s) => s.tags);

  // Локальные состояния для открытия/закрытия модального окна
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  /** 
   * Открывает модалку редактирования для выбранной задачи 
   * @param task — задача, которую редактируем
   */
  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  /** Закрывает модалку и сбрасывает выбранную задачу */
  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedTask(null);
  };

  /**
   * Проверяет, попадает ли дата dueDate в выбранный диапазон
   * @param dueDate — строка ISO с датой дедлайна
   * @returns true, если входит в диапазон или фильтр = 'all'
   */
  const isInDateRange = (dueDate: string) => {
    const date = dayjs(dueDate);
    const now = dayjs();

    switch (dateRange) {
      case 'today':
        return date.isSame(now, 'day');
      case 'week':
        return date.isAfter(now.startOf('week')) && date.isBefore(now.endOf('week'));
      case 'month':
        return date.isAfter(now.startOf('month')) && date.isBefore(now.endOf('month'));
      case 'overdue':
        return date.isBefore(now, 'day') && !date.isSame(now, 'day');
      default:
        // 'all' — без фильтра по дате
        return true;
    }
  };

  /**
   * Применяем все фильтры последовательно:
   * 1. Статус (completed / uncompleted)
   * 2. Приоритет (если выбраны)
   * 3. Дата (today / week / month / overdue)
   * 4. Теги (если выбраны, хотя бы один тег задачи должен совпадать)
   * 5. Текстовый поиск (по названию задачи)
   */
  const filteredTasks = tasks
    .filter((task) => {
      // Фильтр по статусу
      if (statusFilter === 'completed' && !task.completed) return false;
      if (statusFilter === 'uncompleted' && task.completed) return false;

      // Фильтр по приоритету
      if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) return false;

      // Фильтр по диапазону дат
      if (!isInDateRange(task.dueDate)) return false;

      // Фильтр по тегам
      if (
        tagFilter.length > 0 &&
        (!task.tags || !task.tags.some((tag) => tagFilter.includes(tag)))
      ) {
        return false;
      }

      return true;
    })
    .filter((task) =>
      // Фильтр по тексту поиска (игнорируем регистр)
      task.title.toLowerCase().includes(searchText.trim().toLowerCase())
    );

  return (
    <>
      <List
        dataSource={filteredTasks}
        // Параметр locale.emptyText можно добавить, чтобы показать сообщение "Нет задач"
        renderItem={(task) => (
          <List.Item
            key={task.id}
            actions={[
              // Кнопка "Редактировать"
              <Tooltip title="Редактировать" key="edit">
                <Button icon={<EditOutlined />} onClick={() => openEditModal(task)} />
              </Tooltip>,
              // Кнопка "Удалить"
              <Tooltip title="Удалить" key="delete">
                <Button icon={<DeleteOutlined />} danger onClick={() => removeTask(task.id)} />
              </Tooltip>,
            ]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Чекбокс для отметки выполнения */}
              <Checkbox
                checked={task.completed}
                onChange={() => toggleCompleted(task.id)}
                style={{ fontWeight: 500 }}
              >
                {/* Текст задачи, зачёркнутый при выполнении */}
                <Text delete={task.completed} style={{ color: task.completed ? 'gray' : undefined }}>
                  {task.title}
                </Text>
              </Checkbox>

              <Space wrap>
                {/* Приоритет как цветная метка */}
                <Tag color={
                  task.priority === 'high' ? 'red'
                  : task.priority === 'medium' ? 'orange'
                  : 'blue'
                }>
                  {task.priority}
                </Tag>

                {/* Теги задачи, если есть */}
                {task.tags?.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}

                {/* Отметка "Выполнено" если completed === true */}
                {task.completed && (
                  <Tag icon={<CheckCircleOutlined />} color="green">
                    Выполнено
                  </Tag>
                )}

                {/* Отображаем дату дедлайна в формате DD.MM.YYYY */}
                <Tag>{dayjs(task.dueDate).format('DD.MM.YYYY')}</Tag>
              </Space>
            </Space>
          </List.Item>
        )}
      />

      {/* Модальное окно редактирования задачи */}
      <EditTaskModal
        visible={editModalOpen}
        onClose={closeEditModal}
        taskToEdit={selectedTask}
      />
    </>
  );
};

export default TaskList;
