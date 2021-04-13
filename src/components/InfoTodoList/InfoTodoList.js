import React from 'react'
import { Link } from 'react-router-dom'
import './InfoTodoList.scss'

function Task({ title, status }) {
  // status means complete or incomplete
  return (
    <div className="Task">
      {status === 'complete' ? (
        <i className="fa fa-check StatusIndicator"></i>
      ) : (
        <i className="fa fa-clock-o" id="StatusIndicator"></i>
      )}
      <Link to="/profile">
        <p>{title}</p>
      </Link>
    </div>
  )
}
function InfoTodoList() {
  return (
    <div className="TodoList">
      <Task title="Input phone Number" status="incomplete" />
      <Task title="Insert Driver License" status="incomplete" />
      <Task title="Insert Insurance" status="incomplete" />
    </div>
  )
}

export default InfoTodoList
