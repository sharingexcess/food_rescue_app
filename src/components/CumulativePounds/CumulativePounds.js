import React, { useCallback, useState } from 'react'
import { Text } from '@sharingexcess/designsystem'
import {
  ComposedChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  Bar,
} from 'recharts'
import { useFirestore } from 'hooks'
import { formatLargeNumber } from 'helpers'
import { useEffect } from 'react/cjs/react.development'
const data = [
  {
    name: 'Aug',
    uv: 1500000,
    pv: 1000000,
  },
  {
    name: 'Sept',
    uv: 1700000,
    pv: 1200000,
  },
  {
    name: 'Nov',
    uv: 1650000,
    pv: 1200000,
  },
  {
    name: 'Dec',
    uv: 2000000,
    pv: 1600000,
  },
  {
    name: '2022',
    uv: 2100000,
    pv: 1800000,
  },
  {
    name: 'Feb',
    uv: 1900000,
    pv: 2100000,
  },
  {
    name: 'Mar',
    uv: 2300000,
    pv: 2400000,
  },
  {
    name: 'Apr',
    uv: 2500000,
    pv: 2600000,
  },
  {
    name: 'May',
    uv: 2600000,
    pv: 3000000,
  },
  {
    name: 'Jun',
    uv: 2700000,
    pv: 3100000,
  },
  {
    name: 'Jul',
    uv: 5000000,
    pv: 3300000,
  },
]
const renderLineChart = (
  <ComposedChart width={730} height={250} data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <CartesianGrid stroke="#f5f5f5" />
    <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
    <Bar dataKey="pv" barSize={20} fill="grey" />
    <Line type="monotone" dataKey="uv" stroke="green" />
  </ComposedChart>
)

export function CumulativePounds() {
  const [cumulativeWeight, setCumulativeWeight] = useState(0)

  const deliveries = useFirestore(
    'deliveries',
    useCallback(delivery => delivery.status === 9, [])
  )

  useEffect(() => {
    function generateCumulativeWeight() {
      let total = 0
      for (const d of deliveries) {
        total += d.report.weight
      }
      return total
    }

    if (deliveries.length) {
      setCumulativeWeight(generateCumulativeWeight())
    }
  }, [deliveries])

  return (
    <main id="CumulativePounds">
      <div className="body">
        <div className="header">
          <Text type="paragraph" color="grey-dark">
            Cumulative Pounds
          </Text>
        </div>
        <div className="sumPounds">
          <Text type="secondary-header" color="green" align="center">
            {formatLargeNumber(cumulativeWeight)} lbs.
          </Text>
        </div>
        <div className="CumulativePoundsDetailsSection">
          <div className="CumulativePoundsDetails">
            <Text type="small" color="green">
              12,582,77.3
            </Text>
            <Text type="small">&nbsp; Emmisions Reduced in Pounds</Text>
          </div>
          <div className="CumulativePoundsDetails">
            <Text type="small" color="green">
              1,000,000
            </Text>
            <Text type="small">&nbsp; Retail Value</Text>
          </div>
          <div className="CumulativePoundsDetails">
            <Text type="small" color="green">
              1,000,000
            </Text>
            <div className="class"></div>
            <Text type="small">&nbsp; Fair Market Value</Text>
          </div>
        </div>
        <div className="CummulativePoundsGraph">{renderLineChart}</div>
      </div>
    </main>
  )
}
