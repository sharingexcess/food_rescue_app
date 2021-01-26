import { memo } from 'react'
import Header from '../Header/Header'
import './Calendar.scss'

function Calendar() {
  return (
    <div id="Calendar">
      <Header text="Calendar" />
      <iframe
        title="cal"
        src={`https://calendar.google.com/calendar/embed?src=${process.env.REACT_APP_GOOGLE_CALENDAR_ID}&ctz=America%2FNew_York`}
        scrolling="no"
        width={window.innerWidth - 32}
      />
    </div>
  )
}

export default memo(Calendar)
