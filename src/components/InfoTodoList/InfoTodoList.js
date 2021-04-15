import React from 'react'
import { Link } from 'react-router-dom'
import './InfoTodoList.scss'

function Task({ title, isComplete }) {
  // status means complete or incomplete
  return (
    <div className="Task">
      {isComplete ? (
        <i className="fa fa-check complete" id="StatusIndicator"></i>
      ) : (
        <i className="fa fa-times" id="StatusIndicator"></i>
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
  const hasDriverLicense = profile?.driver_license_url ? true : false
  const hasInsurance = profile?.insurance_url ? true : false

  // Only show the tasks list if one of the tasks is not complete
  return hasPhone && hasDriverLicense && hasInsurance ? null : (
    <div className="TodoList">
      <Task title="Input phone Number" isComplete={hasPhone} />
      <Task title="Insert Driver License" isComplete={hasDriverLicense} />
      <Task title="Insert Insurance" isComplete={hasInsurance} />
      <h5>Note: Click on Tasks for instructions</h5>
    </div>
  )
}

export default InfoTodoList
