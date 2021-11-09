import React from 'react'

import { Text } from '@sharingexcess/designsystem'

function CurrentMonthPounds() {
  const totalMonthPounds = 341358.51

  return (
    <main id="Analytics">
      <section id="CurrentMonthPounds">
        <section id="Content">
          <select>
            <option> Current Month CurrentMonthPounds</option>
          </select>
          <select>
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>
          <Text id="TotalMonthPounds">{totalMonthPounds}</Text>
        </section>
      </section>
    </main>
  )
}

export default CurrentMonthPounds
