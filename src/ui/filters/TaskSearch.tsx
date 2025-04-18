import React, { useState, useMemo, useEffect } from 'react';
import { Input } from 'antd';
import debounce from 'lodash.debounce';
import { useFilterStore } from '../../storage/useFilterStore';

const { Search } = Input;

/**
 * TaskSearch — компонент поиска по списку задач.
 * Использует debounce, чтобы не вызывать обновление стора на каждый ввод.
 */
const TaskSearch: React.FC = () => {
  // Локальное состояние для управляемого инпута
  const [value, setValue] = useState('');

  // Метод из стора для обновления текстового фильтра
  const setSearch = useFilterStore((s) => s.setSearch);

  // Текущее значение поиска в сторе (для отладки/сопоставления)
  const searchInStore = useFilterStore((s) => s.search);

  // Логируем локальное и сторовое значение для отладки
  console.log(
    '[TaskSearch] value =',
    value,
    'searchInStore =',
    JSON.stringify(searchInStore)
  );

  /**
   * Создаем debounced-функцию (единожды):
   * — откладывает вызов setSearch на 300 мс откатации ввода
   */
  const debouncedSetSearch = useMemo(
    () =>
      debounce((val: string) => {
        setSearch(val);
      }, 300),
    [setSearch]
  );

  /**
   * onChange инпута:
   * — обновляем локальное значение
   * — запускаем debounced-обновление стора
   */
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    debouncedSetSearch(val);
  };

  /**
   * При размонтировании компонента
   * обязательно отменяем все запланированные вызовы debounce
   */
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  return (
    <Search
      placeholder="Поиск задач..."
      value={value}
      onChange={onChange}
      allowClear
      style={{ width: 300 }}
    />
  );
};

export default TaskSearch;
