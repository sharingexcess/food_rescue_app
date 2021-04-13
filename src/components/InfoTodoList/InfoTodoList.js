import React from 'react'
import { Link } from 'react-router-dom'
import './InfoTodoList.scss'

function Task({ title, isComplete }) {
  // status means complete or incomplete
  return (
    <div className="Task">
      {isComplete ? (
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
function InfoTodoList({ profile }) {
  console.log('User Profile in InfoTodoList >>>', profile)
  const hasPhone = profile?.phone ? true : false
  const hasDriverLicense = false
  const hasInsurance = false

  // Only show the tasks list if one of the tasks is not complete
  return hasPhone && hasDriverLicense && hasInsurance ? null : (
    <div className="TodoList">
      <Task title="Input phone Number" isComplete={hasPhone} />
      <Task title="Insert Driver License" isComplete={false} />
      <Task title="Insert Insurance" isComplete={true} />
    </div>
  )
}

export default InfoTodoList
