import { Text } from '@sharingexcess/designsystem'
import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { getDefaultRangeStart, getDefaultRangeEnd } from './utils'
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
import { useFirestore } from 'hooks'
import {
  FAIR_MARKET_VALUES,
  FOOD_CATEGORIES,
  formatLargeNumber,
  RETAIL_VALUES,
  shortenLargeNumber,
  STATUSES,
} from 'helpers'
import { Loading } from 'components'

export function PoundsInDateRange() {
  const { loadedAllData } = useFirestore()
  const [rangeStart, setRangeStart] = useState(getDefaultRangeStart())
  const [rangeEnd, setRangeEnd] = useState(getDefaultRangeEnd())
  const [retailValue, setRetailValue] = useState(0)
  const [fairMarketValue, setFairMarketValue] = useState(0)
  const [categoryTotals, setCategoryTotals] = useState({})

  const deliveries = useFirestore(
    'stops',
    useCallback(
      s => {
        return (
          s.type === 'delivery' &&
          s.status === STATUSES.COMPLETED &&
          s.timestamp_scheduled_start.toDate() > new Date(rangeStart) &&
          s.timestamp_scheduled_start.toDate() < new Date(rangeEnd)
        )
      },
      [rangeStart, rangeEnd]
    )
  )

  const poundsInRange = useMemo(() => {
    let total_weight = 0
    deliveries.forEach(d => {
      total_weight += d.impact_data_total_weight
    })
    return total_weight
  }, [deliveries])

  useEffect(() => {
    let totalRetail = 0
    let totalFairMarket = 0
    const categoryTotals = {}
    for (const category of FOOD_CATEGORIES) {
      const categoryWeight = deliveries.reduce(
        (total, curr) => total + (curr[category] || 0),
        0
      )
      categoryTotals[category] = categoryWeight
      const categoryRetailValue = categoryWeight * RETAIL_VALUES[category]
      const categoryFairMarketValue =
        categoryWeight * FAIR_MARKET_VALUES[category]
      totalRetail += categoryRetailValue
      totalFairMarket += categoryFairMarketValue
    }
    setRetailValue(totalRetail)
    setFairMarketValue(totalFairMarket)
    setCategoryTotals(categoryTotals)
  }, [deliveries])

  const graphData = [
    {
      name: 'Produce',
      value: categoryTotals.impact_data_produce,
    },
    {
      name: 'Bakery',
      value: categoryTotals.impact_data_bakery,
    },
    {
      name: 'Meat',
      value: categoryTotals.impact_data_meat_fish,
    },
    {
      name: 'Mixed',
      value: categoryTotals.impact_data_mixed,
    },
    {
      name: 'Prepared',
      value: categoryTotals.impact_data_prepared_frozen,
    },
    {
      name: 'Dairy',
      value: categoryTotals.impact_data_dairy,
    },
    {
      name: 'NP',
      value: categoryTotals.impact_data_non_perishable,
    },
    {
      name: 'Other',
      value: categoryTotals.impact_data_other,
    },
  ]

  return loadedAllData ? (
    <main id="PoundsInDateRange">
      <div className="canvas">
        <div className="header">
          <Text type="paragraph" color="black">
            Pounds In Date Range
          </Text>
        </div>

        <div className="InputSection">
          <div className="Input">
            <label className="focused">From...</label>
            <input
              type="datetime-local"
              value={rangeStart}
              onChange={e => setRangeStart(e.target.value)}
            ></input>
          </div>
          <div className="Input">
            <label className="focused">To...</label>
            <input
              type="datetime-local"
              value={rangeEnd}
              onChange={e => setRangeEnd(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="pounds">
          <Text type="secondary-header" color="green">
            {formatLargeNumber(poundsInRange)} lbs.
          </Text>
        </div>
        <div className="details">
          <Text type="small">
            {formatLargeNumber(poundsInRange * 3.66)} lbs. &nbsp; Emmisions
            Reduced in Pounds
          </Text>

          <Text type="small">
            ${formatLargeNumber(retailValue)}
            &nbsp; Retail Value
          </Text>

          <Text type="small">
            ${formatLargeNumber(fairMarketValue)}
            &nbsp; Fair Market Value
          </Text>
        </div>
        <div className="graph">
          <ResponsiveContainer width="95%" height={300}>
            <BarChart
              width={300}
              height={300}
              data={graphData}
              margin={{ top: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" scaleToFit={true} interval={0} />
              <YAxis tickFormatter={num => shortenLargeNumber(num)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="var(--primary)" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  ) : (
    <Loading relative text="Loading analytics data" />
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="Analytics-tooltip">
        <Text type="paragraph" align="center" color="green">
          {data.name}
        </Text>
        <Text type="small" align="center">
          {data.value.toLocaleString()} lbs. rescued
        </Text>
      </div>
    )
  }

  return null
}
