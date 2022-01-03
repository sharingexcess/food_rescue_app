import { FlexContainer, Spacer, Text } from '@sharingexcess/designsystem'
import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { getDefaultRangeStart, getDefaultRangeEnd } from './utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useFirestore } from 'hooks'
import {
  COLORS,
  EMISSIONS_COEFFICIENT,
  FAIR_MARKET_VALUES,
  FOOD_CATEGORIES,
  formatLargeNumber,
  RETAIL_VALUES,
  shortenLargeNumber,
  STATUSES,
} from 'helpers'
import { Loading, Input } from 'components'

export function PoundsInDateRange() {
  const { loadedAllData } = useFirestore()
  const [rangeStart, setRangeStart] = useState(getDefaultRangeStart())
  const [rangeEnd, setRangeEnd] = useState(getDefaultRangeEnd())
  const [retailValue, setRetailValue] = useState(0)
  const [fairMarketValue, setFairMarketValue] = useState(0)
  const [categoryTotals, setCategoryTotals] = useState({})
  const [breakdown, setBreakdown] = useState('Food Category')
  const [chart, setChart] = useState('Bar Chart')

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

  const rescues = useFirestore(
    'rescues',
    useCallback(
      s => {
        return (
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
    for (const category of FOOD_CATEGORIES) {
      const categoryWeight = deliveries.reduce(
        (total, curr) => total + (curr[category] || 0),
        0
      )
      setCategoryTotals(curr => ({ ...curr, [category]: categoryWeight }))
      const categoryRetailValue = categoryWeight * RETAIL_VALUES[category]
      const categoryFairMarketValue =
        categoryWeight * FAIR_MARKET_VALUES[category]
      totalRetail += categoryRetailValue
      totalFairMarket += categoryFairMarketValue
    }
    setRetailValue(totalRetail)
    setFairMarketValue(totalFairMarket)
  }, [deliveries])

  useEffect(() => {
    const types = {
      direct_link: 0,
      retail: 0,
      wholesale: 0,
      food_bank: 0,
      agency: 0,
      home_delivery: 0,
      community_fridge: 0,
      popup: 0,
      holding: 0,
      other: 0,
    }
    for (const r of rescues) {
      for (const s of r.stops) {
        if (r.is_direct_link) {
          types.direct_link += s.impact_data_total_weight || 0
        } else if (s.organization && s.organization.subtype) {
          types[s.organization.subtype] = types[s.organization.subtype]
            ? types[s.organization.subtype] + s.impact_data_total_weight || 0
            : s.impact_data_total_weight || 0
        }
      }
    }
    setCategoryTotals(curr => ({ ...curr, ...types }))
  }, [rescues])

  const graphData =
    breakdown === 'Food Category'
      ? [
          {
            name: 'Dairy',
            value: categoryTotals.impact_data_dairy,
          },
          {
            name: 'Bakery',
            value: categoryTotals.impact_data_bakery,
          },
          {
            name: 'Produce',
            value: categoryTotals.impact_data_produce,
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
            name: 'NP',
            value: categoryTotals.impact_data_non_perishable,
          },
          {
            name: 'Other',
            value: categoryTotals.impact_data_other,
          },
        ]
      : breakdown === 'Donor Type'
      ? [
          {
            name: 'Retail',
            value: categoryTotals.retail,
          },
          {
            name: 'Wholesale',
            value: categoryTotals.wholesale,
          },

          {
            name: 'Direct Link',
            value: categoryTotals.direct_link,
          },
        ]
      : breakdown === 'Recipient Type'
      ? [
          {
            name: 'Food Banks',
            value: categoryTotals.food_bank,
          },
          {
            name: 'Agencies',
            value: categoryTotals.agency,
          },

          {
            name: 'Home Deliveries',
            value: categoryTotals.home_delivery,
          },

          {
            name: 'Popups',
            value: categoryTotals.popup,
          },
          {
            name: 'Community Fridges',
            value: categoryTotals.community_fridge,
          },
        ]
      : null

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="Analytics-tooltip">
          <Text type="paragraph" align="center" color="green">
            {data.name}
          </Text>
          <Text type="small" align="center">
            {data.value.toLocaleString()} lbs. rescued (
            {((100 * data.value) / poundsInRange).toFixed(1)}%)
          </Text>
        </div>
      )
    }

    return null
  }

  return loadedAllData ? (
    <main id="PoundsInDateRange">
      <FlexContainer className="InputSection" primaryAlign="space-between">
        <Input
          type="datetime-local"
          value={rangeStart}
          onChange={e => setRangeStart(e.target.value)}
          label="From..."
        />
        <Input
          type="datetime-local"
          value={rangeEnd}
          onChange={e => setRangeEnd(e.target.value)}
          label="To..."
        />
      </FlexContainer>
      <FlexContainer className="InputSection" primaryAlign="space-between">
        <Input
          type="select"
          value={breakdown}
          onSuggestionClick={e => setBreakdown(e.target.value)}
          suggestions={['Food Category', 'Donor Type', 'Recipient Type']}
          label="Breakdown by..."
        />
        <Input
          type="select"
          value={chart}
          onSuggestionClick={e => setChart(e.target.value)}
          suggestions={['Bar Chart', 'Pie Chart']}
          label="View as..."
        />
      </FlexContainer>
      <Spacer height={16} />
      <FlexContainer primaryAlign="space-between">
        <FlexContainer
          direction="vertical"
          secondaryAlign="start"
          id="PoundsInDateRange-pounds"
        >
          <Text type="primary-header" color="white" shadow>
            {formatLargeNumber(poundsInRange)} lbs.
          </Text>
          <Text color="white" shadow>
            Total Food Rescued
          </Text>
        </FlexContainer>
        <FlexContainer
          direction="vertical"
          secondaryAlign="end"
          className="details"
        >
          <Text type="small" color="white" shadow>
            {formatLargeNumber(poundsInRange * EMISSIONS_COEFFICIENT)} lbs.
            Emissions Reduced
          </Text>

          <Text type="small" color="white" shadow>
            ${formatLargeNumber(retailValue)} Total Retail Value
          </Text>

          <Text type="small" color="white" shadow>
            ${formatLargeNumber(fairMarketValue)} Fair Market Value
          </Text>
        </FlexContainer>
      </FlexContainer>
      <Spacer height={32} />
      <section className="PoundsInDateRange-graph">
        <ResponsiveContainer width="95%" height={300}>
          {chart === 'Bar Chart' ? (
            <BarChart
              width={300}
              height={300}
              data={graphData}
              margin={{ top: 20, bottom: 10 }}
            >
              <XAxis dataKey="name" scaleToFit={true} interval={0} />
              <YAxis tickFormatter={num => shortenLargeNumber(num)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="var(--primary)" barSize={30} />
            </BarChart>
          ) : (
            <PieChart width={400} height={400}>
              <Pie data={graphData} outerRadius={120} dataKey="value">
                {graphData.map((_entry, index) => (
                  <Cell
                    stroke={false}
                    fill={COLORS[index % COLORS.length]}
                    content={'hello'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </section>
    </main>
  ) : (
    <Loading relative text="Loading analytics data" />
  )
}
