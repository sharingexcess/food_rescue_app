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
  label,
  Bar,
} from 'recharts'
import { useFirestore } from 'hooks'
import { calculateCategoryRatios, formatLargeNumber } from 'helpers'
import { useEffect } from 'react/cjs/react.development'
const categories = [
  'bakery',
  'dairy',
  'meat/Fish',
  'mixed groceries',
  'non-perishable',
  'prepared/Frozen',
  'produce',
  'other',
]
const retailValues = {
  bakery: 2.36,
  dairy: 1.28,
  'meat/Fish': 4.4,
  'mixed groceries': 2.31,
  'non-perishable': 3.19,
  'prepared/Frozen': 4.13,
  produce: 1.57,
  other: 2.31,
}
const fairMarketValues = {
  bakery: 2.14,
  dairy: 1.42,
  'meat/Fish': 2.77,
  'mixed groceries': 1.62,
  'non-perishable': 2.13,
  'prepared/Frozen': 2.17,
  produce: 1.13,
  other: 1.62,
}
const data = [
  {
    name: 'Aug',
    'Cumulative Retail': 1500000,
    'Total SE Pounds': 1000000,
  },
  {
    name: 'Sept',
    'Cumulative Retail': 1700000,
    'Total SE Pounds': 1200000,
  },
  {
    name: 'Nov',
    'Cumulative Retail': 1650000,
    'Total SE Pounds': 1200000,
  },
  {
    name: 'Dec',
    'Cumulative Retail': 2000000,
    'Total SE Pounds': 1600000,
  },
  {
    name: '2022',
    'Cumulative Retail': 2100000,
    'Total SE Pounds': 1800000,
  },
  {
    name: 'Feb',
    'Cumulative Retail': 1900000,
    'Total SE Pounds': 2100000,
  },
  {
    name: 'Mar',
    'Cumulative Retail': 2300000,
    'Total SE Pounds': 2400000,
  },
  {
    name: 'Apr',
    'Cumulative Retail': 2500000,
    'Total SE Pounds': 2600000,
  },
  {
    name: 'May',
    'Cumulative Retail': 2600000,
    'Total SE Pounds': 3000000,
  },
  {
    name: 'Jun',
    'Cumulative Retail': 2700000,
    'Total SE Pounds': 3100000,
  },
  {
    name: 'Jul',
    'Cumulative Retail': 5000000,
    'Total SE Pounds': 3300000,
  },
]
const renderLineChart = (
  <ComposedChart width={730} height={250} data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <CartesianGrid stroke="#f5f5f5" />
    <Bar dataKey="Total SE Pounds" barSize={20} fill="grey" />
    <Line type="monotone" dataKey="Cumulative Retail" stroke="green" />
  </ComposedChart>
)

export function CumulativePounds() {
  const [retailValue, setRetailValue] = useState(0)
  const [fairMarketValue, setFairMarketValue] = useState(0)
  const [cumulativeWeight, setCumulativeWeight] = useState(0)
  const [categoryRatios, setCategoryRatios] = useState(0)

  const deliveries = useFirestore(
    'deliveries',
    useCallback(delivery => delivery.status === 9, [])
  )

  const pickups = useFirestore(
    'pickups',
    useCallback(pickup => pickup.status === 9, [])
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

  useEffect(() => {
    if (pickups.length) {
      setCategoryRatios(calculateCategoryRatios(pickups))
    }
  }, [pickups])

  useEffect(() => {
    let totalRetail = 0
    let totalFairMarket = 0
    for (const category of categories) {
      const categoryWeight = cumulativeWeight * categoryRatios[category]
      const categoryRetailValue = categoryWeight * retailValues[category]
      const categoryFairMarketValue =
        categoryWeight * fairMarketValues[category]
      totalRetail += categoryRetailValue
      totalFairMarket += categoryFairMarketValue
    }
    setRetailValue(totalRetail)
    setFairMarketValue(totalFairMarket)
  }, [cumulativeWeight, categoryRatios])

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
              {formatLargeNumber(cumulativeWeight * 3.66)} lbs.
            </Text>
            <Text type="small">&nbsp; Emmisions Reduced in Pounds</Text>
          </div>
          <div className="CumulativePoundsDetails">
            <Text type="small" color="green">
              ${formatLargeNumber(retailValue)}
            </Text>
            <Text type="small">&nbsp; Retail Value</Text>
          </div>
          <div className="CumulativePoundsDetails">
            <Text type="small" color="green">
              ${formatLargeNumber(fairMarketValue)}
            </Text>
            <div className="class"></div>
            <Text type="small">&nbsp; Fair Market Value</Text>
          </div>
        </div>
        <div className="graphTitle">
          <Text type="graph-title">Cumulative Value Ending July 2021</Text>
        </div>
        <div className="CummulativePoundsGraph">{renderLineChart}</div>
      </div>
    </main>
  )
}
