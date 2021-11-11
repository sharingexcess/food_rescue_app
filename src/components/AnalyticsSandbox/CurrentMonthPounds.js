import { Pie, PieChart, BarChart, XAxis, YAxis, Bar } from 'recharts'
import { Text } from '@sharingexcess/designsystem'

export function CurrentMonthPounds() {
  const totalMonthPounds = 341358.51
  const emissionsReduced = 10000000
  const retailValue = 1000000
  const fairMarketValue = 1000000

  const data01 = [
    {
      name: 'Group A',
      value: 400,
    },
    {
      name: 'Group B',
      value: 300,
    },
    {
      name: 'Group C',
      value: 300,
    },
    {
      name: 'Group D',
      value: 200,
    },
    {
      name: 'Group E',
      value: 278,
    },
    {
      name: 'Group F',
      value: 189,
    },
  ]

  const data = [{ name: 'A', x: 12, y: 23, z: 122 }]

  return (
    <main id="Revamp">
      <section id="CurrentMonthPounds">
        <section id="Content">
          <select>
            <option>Current Month Pounds</option>
            <option>Current Year Pounds</option>
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
          <div>
            <Text type="secondary-header" color="green" align="center">
              {totalMonthPounds}
            </Text>
          </div>
          <div id="MonthReport">
            <Text type="small" color="green">
              {emissionsReduced}
            </Text>
            <Text type="small" color="black">
              Emissions Reduced in Pounds
            </Text>
          </div>
          <div>
            <Text type="small" color="green">
              ${retailValue}{' '}
            </Text>
            <Text type="small" color="black">
              Retail Value
            </Text>
          </div>
          <div>
            <Text type="small" color="green">
              ${fairMarketValue}{' '}
            </Text>
            <Text type="small" color="black">
              Fair Market Value
            </Text>
          </div>
        </section>

        <section id="Content">
          <PieChart width={300} height={180}>
            <Pie
              data={data01}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={50}
              fill="#8884d8"
              label
            />
          </PieChart>
          <BarChart layout="vertical" width={300} height={100} data={data}>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" scale="band" />
            <Bar dataKey="x" stackId="a" barSize={20} fill="#8884d8" />
            <Bar dataKey="y" stackId="a" barSize={20} fill="#82ca9d" />
          </BarChart>
        </section>
      </section>
    </main>
  )
}
