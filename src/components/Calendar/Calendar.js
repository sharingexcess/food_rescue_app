import { memo } from 'react'
import './Calendar.scss'

function Calendar() {
  // async function getCalEvents() {
  //   window.gapi.client.calendar.events
  //     .list({
  //       calendarId: 'rn2umgc8h8bmapgi0cr60agmsc@group.calendar.google.com',
  //       timeMin: new Date().toISOString(),
  //       showDeleted: false,
  //       singleEvents: true,
  //       maxResults: 10,
  //       orderBy: 'startTime',
  //     })
  //     .then(response => {
  //       const events = response.result.items
  //       console.log('EVENTS: ', events)
  //     })
  // }

  return (
    <div id="Calendar">
      <h1>Rescue Calendar</h1>
      <iframe
        title="cal"
        src="https://calendar.google.com/calendar/embed?src=rn2umgc8h8bmapgi0cr60agmsc%40group.calendar.google.com&ctz=America%2FNew_York"
        scrolling="no"
      />
    </div>
  )
}

export default memo(Calendar)
