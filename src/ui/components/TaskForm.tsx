import React from 'react';
import { Button, DatePicker, Form, FormInstance, Input, Select } from 'antd';
import dayjs from 'dayjs';
import { useTaskStore } from '../../storage/useTaskStore';
import { Task } from '../../core/types';
import { v4 as uuidv4 } from 'uuid';

const { TextArea } = Input;
const { Option } = Select;

type TaskFormProps = {
  /** Если передана — форма будет управляться извне (для редактирования) */
  form?: FormInstance;
  /** Флаг: true — режим редактирования, false — режим добавления */
  isEdit?: boolean;
  /** Начальные значения для полей (используется при редактировании) */
  initialValues?: Task;
  /** Колбэк при завершении редактирования */
  onFinishEdit?: (values: Task) => void;
};

const TaskForm: React.FC<TaskFormProps> = ({
  form,
  isEdit = false,
  initialValues,
  onFinishEdit,
}) => {
  // Если родитель не передал form — создаём собственную форму
  const [internalForm] = Form.useForm();
  const activeForm = form || internalForm;

  // Стор для операций с задачами
  const addTask = useTaskStore((state) => state.addTask);
  const tasks = useTaskStore((s) => s.tasks);

  // Вычисляем все уникальные теги из существующих задач,
  // чтобы предложить их как опции в поле тегов
  const allTags = Array.from(
    new Set(tasks.flatMap((task) => task.tags || []))
  );

  /**
   * Блокирует выбор дат раньше, чем сегодня
   * @param current — текущая проверяемая дата
   */
  const disabledDate = (current: dayjs.Dayjs) =>
    current && current < dayjs().startOf('day');

  /**
   * Обработка отправки формы (добавление или сохранение изменений)
   * @param values — значения полей формы: title, dueDate, priority, tags
   */
  const handleSubmit = (values: any) => {
    // Составляем объект Task для сохранения
    const newTask: Task = {
      id: isEdit && initialValues ? initialValues.id : uuidv4(),
      title: values.title,
      dueDate: values.dueDate.toISOString(),
      priority: values.priority,
      tags: values.tags || [],
      completed: isEdit && initialValues ? initialValues.completed : false,
      createdAt: initialValues
        ? initialValues.createdAt
        : new Date().toISOString(),
    };

    if (isEdit && onFinishEdit) {
      // Если в режиме редактирования — вызываем колбэк
      onFinishEdit(newTask);
    } else {
      // Иначе — добавляем новую задачу в стор и сбрасываем форму
      addTask(newTask);
      activeForm.resetFields();
    }
  };

  return (
    <Form
      // Используем либо переданную, либо внутреннюю форму
      form={activeForm}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        // При редактировании подставляем initialValues
        ...initialValues,
        dueDate: initialValues?.dueDate
          ? dayjs(initialValues.dueDate)
          : undefined,
      }}
      style={{
        background: '#fff',
        padding: 24,
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {/* Поле для ввода заголовка задачи */}
      <Form.Item
        name="title"
        label="Название задачи"
        rules={[
          { required: true, message: 'Введите название задачи' },
          { min: 3, message: 'Минимум 3 символа' },
        ]}
      >
        <TextArea
          placeholder="Что нужно сделать?"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>

      {/* Поле для выбора даты дедлайна */}
      <Form.Item
        name="dueDate"
        label="Срок выполнения"
        rules={[{ required: true, message: 'Выберите срок' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          disabledDate={disabledDate}
          format="DD.MM.YYYY"
        />
      </Form.Item>

      {/* Поле для выбора приоритета */}
      <Form.Item
        name="priority"
        label="Приоритет"
        rules={[{ required: true, message: 'Выберите приоритет' }]}
      >
        <Select>
          <Option value="low">Низкий</Option>
          <Option value="medium">Средний</Option>
          <Option value="high">Высокий</Option>
        </Select>
      </Form.Item>

      {/* Теги: можно выбрать из существующих или ввести новые */}
      <Form.Item name="tags" label="Теги (необязательно)">
        <Select mode="tags" style={{ width: '100%' }} placeholder="Введите теги">
          {allTags.map((tag) => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Кнопка отправки формы */}
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {isEdit ? 'Сохранить изменения' : 'Добавить задачу'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;
