import { ExternalLink, Spacer, Text } from '@sharingexcess/designsystem'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export function PoundsInDateRange() {
  const pounds = 300000000
  const emissionReduced = 10000000
  const retailValue = 100000000
  const fairMarketValue = 100000000000
  const data = [
    {
      name: 'Produce',
      value: 40000,
    },
    {
      name: 'Bakery',
      value: 13000,
    },
    {
      name: 'Meat',
      value: 9000,
    },
    {
      name: 'Mixed',
      value: 8000,
    },
    {
      name: 'Prepared',
      value: 8500,
    },
    {
      name: 'Dairy',
      value: 2000,
    },
    {
      name: 'NP',
      value: 500,
    },
    {
      name: 'Other',
      value: 450,
    },
  ]
  return (
    <main id="PoundsInDateRange">
      <div class="canvas">
        <div class="header">
          <Text type="paragraph" color="black">
            Pounds In Date Range ...
          </Text>
        </div>

        <div class="InputSection">
          <div class="Input">
            <label class="focused">From</label>
            <input
              element_id="date_start"
              autocomplete="off"
              label="From"
              type="datetime-local"
              placeholder=""
              value="2021-11-12T14:00"
            ></input>
          </div>
          <div class="Input">
            <label class="focused">To</label>
            <input
              id="date_end"
              autocomplete="off"
              label="From"
              type="datetime-local"
              placeholder=""
              value="2021-11-12T14:00"
            ></input>
          </div>
        </div>
        <div class="pounds">
          <Text type="secondary-header" color="green">
            {pounds}
          </Text>
        </div>
        <div class="details">
          <Text type="small" color="black">
            {emissionReduced} Emissions Reduced In Pounds <br />
            {retailValue} Retail Value <br />
            {fairMarketValue} Fair Market Value <br />
          </Text>
        </div>
        <div class="graph">
          <ResponsiveContainer width="95%" height={300}>
            <BarChart
              width={300}
              height={300}
              data={data}
              margin={{ top: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" scaleToFit={true} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="var(--primary)" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  )
}
