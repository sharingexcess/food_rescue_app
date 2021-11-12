import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
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
    { name: 'Warehosue Outgoing', value: 33343.5 },
    { name: 'Food Rescue', value: 74590 },
    { name: 'Direct Link', value: 234425 },
  ]

  const bardata = [{ name: 'July 2021', x: 13, y: 23 }]

  const COLORS = ['#216810', '#9DA1A4', '#4EA528']

  return (
    <main id="Revamp">
      <section id="CurrentMonthPounds">
        <section id="Content" style={{ marginLeft: '5%' }}>
          <select style={{ marginTop: '3%' }}>
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
          <Text
            id="CurrentMonthPoundsLabel"
            type="secondary-header"
            color="green"
            align="center"
          >
            {totalMonthPounds}
          </Text>
          <section>
            <Text type="small" color="green">
              {emissionsReduced}
            </Text>
            <Text type="small" color="black">
              Emissions Reduced in Pounds
            </Text>
          </section>
          <section>
            <Text type="small" color="green">
              ${retailValue}
            </Text>
            <Text type="small" color="black">
              Retail Value
            </Text>
          </section>
          <section>
            <Text type="small" color="green">
              ${fairMarketValue}
            </Text>
            <Text type="small" color="black">
              Fair Market Value
            </Text>
          </section>
        </section>

        <section
          id="Content"
          style={{
            background: '#E6E8EA',
            paddingTop: '2%',
            marginRight: '5%',
          }}
        >
          <Text type="graph-title" color="black" align="center">
            Breakdown of pounds in July 2021
          </Text>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart margin={{ top: 10, right: 5, bottom: 10, left: 5 }}>
              <Pie
                dataKey="value"
                isAnimationActive="true"
                data={piedata}
                outerRadius={40}
                fill="#8884d8"
              >
                {piedata.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend align="center" iconType="circle" iconSize="12" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <Text type="graph-title" color="black" align="center">
            Forecast versus Actual Performance
          </Text>
          <ResponsiveContainer width="90%" height={60}>
            <BarChart layout="vertical" data={bardata}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" scale="band" />
              <Bar dataKey="x" stackId="a" barSize={15} fill="#9DA1A4" />
              <Bar dataKey="y" stackId="a" barSize={15} fill="#4EA528" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </section>
    </main>
  )
}
