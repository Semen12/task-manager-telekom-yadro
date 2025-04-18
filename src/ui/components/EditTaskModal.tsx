import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import { Task } from '../../core/types';
import TaskForm from './TaskForm';
import { useTaskStore } from '../../storage/useTaskStore';

/**
 * Пропсы модального окна редактирования задачи:
 * @param visible — флаг, показывать ли модалку
 * @param onClose — колбэк при закрытии (Cancel или после сохранения)
 * @param taskToEdit — задача, которую нужно отредактировать (или null)
 */
type EditTaskModalProps = {
  visible: boolean;
  onClose: () => void;
  taskToEdit: Task | null;
};

/**
 * Компонент модального окна редактирования задачи.
 * Использует форму TaskForm и Zustand‑стор для сохранения изменений.
 */
const EditTaskModal: React.FC<EditTaskModalProps> = ({
  visible,
  onClose,
  taskToEdit,
}) => {
  // создаём экземпляр формы Ant Design
  const [form] = Form.useForm();

  // метод из стора для обновления задачи
  const updateTask = useTaskStore((state) => state.updateTask);

  /**
   * При изменении taskToEdit сбрасываем поля формы:
   * - заполняем все поля значениями из taskToEdit
   * - конвертируем dueDate в объект dayjs, если нужно
   */
  useEffect(() => {
    if (taskToEdit) {
      form.setFieldsValue({
        ...taskToEdit,
        // Ант‑дэйтпикер ожидает dayjs-объект или undefined
        dueDate: taskToEdit.dueDate
          ? form.getFieldValue('dueDate')
          : undefined,
      });
    }
  }, [taskToEdit, form]);

  /**
   * Обработчик отправки формы при редактировании:
   * - вызывает updateTask из стора
   * - закрывает модалку
   */
  const handleEditFinish = (updatedTask: Task) => {
    updateTask(updatedTask);
    onClose();
  };

  return (
    <Modal
      title="Редактировать задачу"
      open={visible}         // управляемое свойство видимости
      onCancel={onClose}     // при клике на крестик или фон
      footer={null}          // убираем стандартные кнопки Ok/Cancel
      destroyOnClose         // размонтировать содержимое при закрытии
    >
      {taskToEdit && (
        <TaskForm
          form={form}                // передаём форму для управления извне
          isEdit                     // флаг режима редактирования
          initialValues={taskToEdit} // начальные значения полей
          onFinishEdit={handleEditFinish} // колбэк при сабмите
        />
      )}
    </Modal>
  );
};

export default EditTaskModal;
