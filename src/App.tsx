
import './App.css'
import TaskForm from './ui/components/TaskForm'
import TaskList from './ui/components/TaskList'
import TaskFiltersPanel from './ui/filters/TaskFiltersPanel'
import { Row, Col } from 'antd'

function App() {


  return (
    <Row gutter={24}>
      {/* Левая колонка — Форма */}
      <Col xs={24} md={10} lg={8}>
        <TaskForm />
      </Col>

      {/* Правая колонка — Фильтры и задачи */}
      <Col xs={24} md={14} lg={16}>
        <TaskFiltersPanel />
        <TaskList />
      </Col>
    </Row>
        
    
 
  )
}

export default App
