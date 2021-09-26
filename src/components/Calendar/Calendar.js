import React from 'react'

export function Calendar() {
  return (
    <div id="Calendar">
      <iframe
        title="cal"
        src={`https://calendar.google.com/calendar/embed?src=${process.env.REACT_APP_GOOGLE_CALENDAR_ID}&ctz=America%2FNew_York`}
        scrolling="no"
        width={window.innerWidth - 32}
      />
    </div>
  )
}
