import {
  Cell,
  Legend,
  Pie,
  PieChart,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
} from 'recharts'
import { Text } from '@sharingexcess/designsystem'

export function CurrentMonthPounds() {
  const totalMonthPounds = 341358.51
  const emissionsReduced = 10000000
  const retailValue = 1000000
  const fairMarketValue = 1000000

  const piedata = [
    { name: 'Group A', value: 33343.5 },
    { name: 'Group B', value: 74590 },
    { name: 'Group C', value: 234425 },
  ]

  const bardata = [{ name: 'A', x: 13, y: 23 }]

  const COLORS = ['#216810', '#9DA1A4', '#4EA528']

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
          <section>
            <Text type="secondary-header" color="green" align="center">
              {totalMonthPounds}
            </Text>
          </section>
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
              ${retailValue}
            </Text>
            <Text type="small" color="black">
              Retail Value
            </Text>
          </div>
          <div>
            <Text type="small" color="green">
              ${fairMarketValue}
            </Text>
            <Text type="small" color="black">
              Fair Market Value
            </Text>
          </div>
        </section>

        <section
          id="Content"
          style={{ background: '#E6E8EA', padding: '20px' }}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                dataKey="value"
                isAnimationActive="true"
                data={piedata}
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {piedata.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend style={{ align: 'center' }} />
            </PieChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="90%" height={100}>
            <BarChart layout="vertical" data={bardata}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" scale="band" />
              <Bar dataKey="x" stackId="a" barSize={20} fill="#9DA1A4" />
              <Bar dataKey="y" stackId="a" barSize={20} fill="#4EA528" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </section>
    </main>
  )
}
