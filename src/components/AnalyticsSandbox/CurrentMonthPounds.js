import React from 'react'

function CurrentMonthPounds() {
  const totalMonthPounds = 341358.51
  const emissionsReduced = 10000000
  const retailValue = 1000000
  const fairMarketValue = 1000000

  return (
    <main id="Analytics">
      <section id="CurrentMonthPounds">
        <section id="Content">
          <select>
            <option> Current Month Pounds</option>
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
          <div id="TotalMonthPounds" formNoValidate>
            {totalMonthPounds}
          </div>
          <section id="MonthReport">
            <div id="Value">{emissionsReduced} </div>
            <div id="Label">Emissions Reduced in Pounds</div>
          </section>
          <section id="MonthReport">
            <div id="Value">${retailValue} </div>
            <div id="Label">Retail Value</div>
          </section>
          <section id="MonthReport">
            <div id="Value">${fairMarketValue} </div>
            <div id="Label">Fair Market Value</div>
          </section>
        </section>

        <section id="Content"> Graph can go here</section>
      </section>
    </main>
  )
}

export default CurrentMonthPounds
