import { FlexContainer, Spacer, Text } from '@sharingexcess/designsystem'
import React, { useState, useEffect, useMemo } from 'react'
import { getDefaultRangeStart, getDefaultRangeEnd } from './utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  PieChart,
  Pie,
  Cell,
  Treemap,
} from 'recharts'
import {
  CLOUD_FUNCTION_URLS,
  COLORS,
  formatLargeNumber,
  formatTimestamp,
  shortenLargeNumber,
} from 'helpers'
import { Loading, Input } from 'components'
import { useNavigate } from 'react-router-dom'

export function Analytics() {
  const navigate = useNavigate()
  const search = new URLSearchParams(window.location.search)
  const [rangeStart, setRangeStart] = useState(getDefaultRangeStart())
  const [rangeEnd, setRangeEnd] = useState(getDefaultRangeEnd())
  const [breakdown, setBreakdown] = useState(
    search.get('breakdown')
      ? decodeURIComponent(search.get('breakdown'))
      : 'Food Category'
  )
  const [chart, setChart] = useState('Bar Chart')
  const [apiData, setApiData] = useState()
  const [working, setWorking] = useState(true)

  const query = useMemo(() => {
    const date_range_start = formatTimestamp(new Date(rangeStart), 'YYYY-MM-DD')
    const date_range_end = formatTimestamp(new Date(rangeEnd), 'YYYY-MM-DD')
    return `?date_range_start=${encodeURIComponent(
      date_range_start
    )}&date_range_end=${encodeURIComponent(
      date_range_end
    )}&breakdown=${encodeURIComponent(breakdown)}`
  }, [rangeStart, rangeEnd, breakdown])

  useEffect(() => {
    if (window.location.search !== query) {
      setWorking(true)
      navigate(query, { replace: true })
    } else {
      console.log('fetching', CLOUD_FUNCTION_URLS.analytics + query)
      fetch(CLOUD_FUNCTION_URLS.analytics + query)
        .then(res => res.json())
        .then(data => {
          setApiData(data)
          setWorking(false)
        })
    }
  }, [query]) // eslint-disable-line

  const graphData = !apiData
    ? null
    : breakdown === 'Food Category'
    ? [
        {
          name: 'Dairy',
          value: apiData.view_data.impact_data_dairy,
        },
        {
          name: 'Bakery',
          value: apiData.view_data.impact_data_bakery,
        },
        {
          name: 'Produce',
          value: apiData.view_data.impact_data_produce,
        },
        {
          name: 'Meat',
          value: apiData.view_data.impact_data_meat_fish,
        },
        {
          name: 'Mixed',
          value: apiData.view_data.impact_data_mixed,
        },
        {
          name: 'Prepared',
          value: apiData.view_data.impact_data_prepared_frozen,
        },
        {
          name: 'NP',
          value: apiData.view_data.impact_data_non_perishable,
        },
        {
          name: 'Other',
          value: apiData.view_data.impact_data_other,
        },
      ].sort((a, b) => b.value - a.value)
    : breakdown === 'Donor Type'
    ? [
        {
          name: 'Retail',
          value: apiData.view_data.retail,
        },
        {
          name: 'Wholesale',
          value: apiData.view_data.wholesale,
        },

        {
          name: 'Direct Link',
          value: apiData.view_data.direct_link,
        },
      ].sort((a, b) => b.value - a.value)
    : breakdown === 'Recipient Type'
    ? [
        {
          name: 'Food Banks',
          value: apiData.view_data.food_bank,
        },
        {
          name: 'Agencies',
          value: apiData.view_data.agency,
        },

        {
          name: 'Home Deliveries',
          value: apiData.view_data.home_delivery,
        },

        {
          name: 'Popups',
          value: apiData.view_data.popup,
        },
        {
          name: 'Community Fridges',
          value: apiData.view_data.community_fridge,
        },
      ].sort((a, b) => b.value - a.value)
    : ['Donor', 'Recipient', 'Driver'].includes(breakdown)
    ? Object.keys(apiData.view_data).map(key => ({
        name: key,
        value: apiData.view_data[key],
      }))
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
            {((100 * data.value) / apiData.total_weight).toFixed(1)}%)
          </Text>
        </div>
      )
    }

    return null
  }

  const CustomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          fill="var(--se-grey-dark)"
          transform="rotate(-40)"
          width={5}
          textAnchor="end"
          verticalAnchor="middle"
          scaleToFit={true}
        >
          {payload.value.substring(0, 13)}
          {payload.value.length >= 13 ? '...' : ''}
        </text>
      </g>
    )
  }

  return (
    <main id="Analytics">
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
          suggestions={[
            'Food Category',
            'Donor Type',
            'Recipient Type',
            'Donor',
            'Recipient',
            'Driver',
          ]}
          label="Breakdown by..."
        />
        <Input
          type="select"
          value={chart}
          onSuggestionClick={e => setChart(e.target.value)}
          suggestions={['Bar Chart', 'Pie Chart', 'Block Chart', 'Table']}
          label="View as..."
        />
      </FlexContainer>
      <Spacer height={16} />

      {apiData && !working ? (
        <>
          <FlexContainer primaryAlign="space-between">
            <FlexContainer
              direction="vertical"
              secondaryAlign="start"
              id="PoundsInDateRange-pounds"
            >
              <Text type="primary-header" color="white" shadow>
                {formatLargeNumber(apiData.total_weight)} lbs.
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
                {formatLargeNumber(apiData.emissions_reduced)} lbs. Emissions
                Reduced
              </Text>

              <Text type="small" color="white" shadow>
                ${formatLargeNumber(apiData.retail_value)} Total Retail Value
              </Text>

              <Text type="small" color="white" shadow>
                ${formatLargeNumber(apiData.fair_market_value)} Fair Market
                Value
              </Text>
            </FlexContainer>
          </FlexContainer>
          <Spacer height={32} />
          <section className="PoundsInDateRange-graph">
            <ResponsiveContainer width="100%" height={500}>
              {chart === 'Bar Chart' ? (
                <BarChart
                  width={300}
                  height={300}
                  data={graphData}
                  margin={{ top: 20, bottom: 96, right: 20 }}
                >
                  <XAxis
                    dataKey="name"
                    interval={0}
                    allowDataOverflow={false}
                    tick={<CustomXAxisTick />}
                    height={0.1}
                    tickSize={25}
                  ></XAxis>
                  <YAxis tickFormatter={num => shortenLargeNumber(num)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="var(--primary)" barSize={30} />
                  <Brush
                    dataKey="name"
                    height={20}
                    stroke="var(--se-grey-primary)"
                    travellerWidth={0}
                    startIndex={0}
                    endIndex={7}
                  />
                </BarChart>
              ) : chart === 'Pie Chart' ? (
                <PieChart width={400} height={400}>
                  <Pie data={graphData} outerRadius={120} dataKey="value">
                    {graphData.map((_entry, index) => (
                      <Cell
                        key={index}
                        stroke={null}
                        fill={COLORS[index % COLORS.length]}
                        content={'hello'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              ) : chart === 'Block Chart' ? (
                <Treemap
                  data={graphData}
                  dataKey="value"
                  ratio={1 / 1}
                  content={<TreemapContent />}
                >
                  <Tooltip content={<CustomTooltip />} />
                </Treemap>
              ) : (
                <div id="Analytics-table">
                  <div className="Analytics-table-header">Name</div>
                  <div className="Analytics-table-header">Total Weight</div>
                  <div className="Analytics-table-header">% of Total</div>
                  {graphData.map((row, i) => (
                    <>
                      <div key={`${i}-name`} className="Analytics-table-name">
                        {row.name}
                      </div>
                      <div key={`${i}-total`} className="Analytics-table-total">
                        {formatLargeNumber(row.value)} lbs.
                      </div>
                      <div
                        key={`${i}-percent`}
                        className="Analytics-table-percent"
                      >
                        {((100 * row.value) / apiData.total_weight).toFixed(2)}%
                      </div>
                    </>
                  ))}
                </div>
              )}
            </ResponsiveContainer>
          </section>
        </>
      ) : (
        <>
          <Spacer height={32} />
          <Loading relative text="Calculating" />
        </>
      )}
    </main>
  )
}

function TreemapContent({ depth, x, y, width, height, index, name }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % 6],
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      <foreignObject x={x} y={y} height={height} width={width}>
        <p style={{ fontSize: Math.round(width * 0.1) }}>{name}</p>
      </foreignObject>
    </g>
  )
}
