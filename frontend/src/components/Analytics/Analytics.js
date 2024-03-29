import {
  Flex,
  Box,
  Text,
  Select,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import { getDefaultRangeStart, getDefaultRangeEnd } from './Analytics.utils'
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
import { formatLargeNumber, shortenLargeNumber } from 'helpers'
import { endOfDay, startOfDay } from './helper'
import { Loading } from 'components'
import { useApi, useIsMobile } from 'hooks'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { DonorRecipients } from './DonorRecipients'

const COLORS = [
  '#205a08',
  '#307e0e',
  '#4ea528',
  '#6bcf3f',
  '#8af55c',
  '#b8ff9a',
]

export function Analytics() {
  const search = new URLSearchParams(window.location.search)
  const [selectedStartDate, setSelectedStartDate] = useState(
    new Date(getDefaultRangeStart())
  )
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date(getDefaultRangeEnd())
  )
  const [startDate, setStartDate] = useState(selectedStartDate)
  const [endDate, setEndDate] = useState(selectedEndDate)

  const [breakdown, setBreakdown] = useState(
    search.get('breakdown')
      ? decodeURIComponent(search.get('breakdown'))
      : 'Food Category'
  )
  const [chart, setChart] = useState('Bar Chart')
  const [showAdvanced] = useState(true)
  const [transferType, setTransferType] = useState('Distributions')

  const params = useMemo(
    () => ({
      date_range_start: startOfDay(startDate),
      date_range_end: endOfDay(endDate),
      breakdown,
      transferType,
    }),
    [startDate, endDate, breakdown, transferType]
  )

  const { data: apiData, loading } = useApi('/analytics', params)

  const handleApplyClick = () => {
    setStartDate(selectedStartDate)
    setEndDate(selectedEndDate)
  }

  // this useEfect updates the current URL on state changes
  // to preserve the current query over refresh/back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('date_range_start', startOfDay(startDate))
    params.set('date_range_end', endOfDay(endDate))
    params.set('breakdown', breakdown)
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [startDate, endDate, breakdown])

  const isMobile = useIsMobile()

  const graphData = !apiData
    ? null
    : breakdown === 'Food Category'
    ? [
        {
          name: 'Dairy',
          value: apiData.view_data.dairy,
        },
        {
          name: 'Bakery',
          value: apiData.view_data.bakery,
        },
        {
          name: 'Produce',
          value: apiData.view_data.produce,
        },
        {
          name: 'Meat',
          value: apiData.view_data.meat_fish,
        },
        {
          name: 'Mixed',
          value: apiData.view_data.mixed,
        },
        {
          name: 'Prepared',
          value: apiData.view_data.prepared_frozen,
        },
        {
          name: 'NP',
          value: apiData.view_data.non_perishable,
        },
        {
          name: 'Other',
          value: apiData.view_data.other,
        },
      ].sort((a, b) => b.value - a.value)
    : breakdown === 'Location Type'
    ? Object.keys(apiData.view_data)
        .map(key => ({
          name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: apiData.view_data[key],
        }))
        .sort((a, b) => b.value - a.value)
    : breakdown === 'Rescue Type'
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
    : breakdown === 'Location and Rescue Type'
    ? [
        {
          name: 'Wholesale -- PWPM',
          value: apiData.view_data.wholesale_pwpm,
        },
        {
          name: 'Direct Link -- PWPM',
          value: apiData.view_data.direct_link_pwpm,
        },
        {
          name: 'Retail -- PWPM',
          value: apiData.view_data.retail_pwpm,
        },
        {
          name: 'Wholesale (Hunts Point)',
          value: apiData.view_data.wholesale_hunts_point,
        },
        {
          name: 'Direct Link (Hunts Point)',
          value: apiData.view_data.direct_link_hunts_point,
        },
        {
          name: 'Retail (Hunts Point)',
          value: apiData.view_data.retail_hunts_point,
        },
      ]
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
          fill="var(--chakra-colors-element-tertiary)"
          transform="rotate(-40)"
          width={5}
          textAnchor="end"
        >
          {payload.value ? payload.value.slice(0, 13) : ''}
          {payload.value.length >= 13 ? '...' : ''}
        </text>
      </g>
    )
  }

  return (
    <main id="Analytics">
      <Flex
        gap="4"
        justify="space-between"
        mb="2"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'flex-end'}
      >
        <Box>
          <Text fontWeight="600" color="element.tertiary">
            From
          </Text>
          <DatePicker
            selected={selectedStartDate}
            onChange={date => setSelectedStartDate(date)}
            selectsStart
            startDate={selectedStartDate}
            endDate={selectedEndDate}
          />
        </Box>
        <Box>
          <Text fontWeight="600" color="element.tertiary">
            To
          </Text>
          <DatePicker
            selected={selectedEndDate}
            onChange={date => setSelectedEndDate(date)}
            selectsEnd
            startDate={selectedStartDate}
            endDate={selectedEndDate}
            minDate={selectedStartDate}
          />
        </Box>
        <Button onClick={handleApplyClick} size="sm">
          Apply
        </Button>
      </Flex>
      <Flex gap="4" justify="space-between" mb="4">
        <Box w={'100%'}>
          <Text fontWeight="600" color="element.tertiary">
            Breakdown
          </Text>
          <Select
            value={breakdown}
            onChange={e => setBreakdown(e.target.value)}
          >
            <option>Food Category</option>
            <option>Rescue Type</option>
            <option>Location Type</option>
            <option>Location and Rescue Type</option>
            <option>Recipient Type</option>
            <option>Donor</option>
            <option>Recipient</option>
            <option>Driver</option>
          </Select>
        </Box>
        <Box w={isMobile ? '75%' : '100%'}>
          <Text fontWeight="600" color="element.tertiary">
            View
          </Text>
          <Select value={chart} onChange={e => setChart(e.target.value)}>
            <option>Bar Chart</option>
            <option>Pie Chart</option>
            <option>Block Chart</option>
            <option>Table</option>
          </Select>
        </Box>
        <Box w={isMobile ? '40%' : '70%'}>
          <Text fontWeight="600" color="element.tertiary">
            Type
          </Text>
          <Select
            value={transferType}
            onChange={e => setTransferType(e.target.value)}
          >
            <option>Distributions</option>
            <option>Collections</option>
          </Select>
        </Box>
      </Flex>
      <Box height={16} />
      {apiData && !loading ? (
        <>
          <Flex justify="space-between">
            <Flex
              direction="column"
              align="start"
              id="PoundsInDateRange-pounds"
            >
              <Heading>{formatLargeNumber(apiData.total_weight)} lbs.</Heading>
              <Text color="element.tertiary">
                Total Food Rescued{' '}
                {transferType === 'Collections' ? '(Collected)' : '(Donated)'}
              </Text>
            </Flex>
            <Flex direction="column" align="end">
              <Text fontSize="sm" color="element.tertiary">
                <Text as="span" fontWeight="700" color="element.primary">
                  {formatLargeNumber(apiData.emissions_reduced)}
                </Text>{' '}
                lbs. GHG Reduced
              </Text>

              <Text fontSize="sm" color="element.tertiary">
                <Text as="span" fontWeight="700" color="element.primary">
                  ${formatLargeNumber(apiData.retail_value)}
                </Text>{' '}
                Total Retail Value
              </Text>

              <Text fontSize="sm" color="element.tertiary">
                <Text as="span" fontWeight="700" color="element.primary">
                  ${formatLargeNumber(apiData.fair_market_value)}
                </Text>{' '}
                Fair Market Value
              </Text>
            </Flex>
          </Flex>
          <Box height={8} />
          <section className="PoundsInDateRange-graph">
            <ResponsiveContainer width="100%" height={320}>
              {chart === 'Bar Chart' ? (
                <BarChart
                  width="100%"
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
                  <Bar
                    dataKey="value"
                    fill="var(--chakra-colors-se-brand-primary)"
                    barSize={30}
                  />
                  <Brush
                    dataKey="name"
                    height={20}
                    stroke="var(--chakra-colors-element-tertiary)"
                    travellerWidth={0}
                    startIndex={0}
                    endIndex={7}
                  />
                </BarChart>
              ) : chart === 'Pie Chart' ? (
                <PieChart width="100%" height={400}>
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
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Total Weight</Th>
                      <Th>% of Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {graphData.map((row, i) => (
                      <Tr key={i}>
                        <Td>
                          <Text>{row.name}</Text>
                        </Td>
                        <Td>
                          <Text>{formatLargeNumber(row.value)} lbs.</Text>
                        </Td>
                        <Td>
                          <Text>
                            {((100 * row.value) / apiData.total_weight).toFixed(
                              2
                            )}
                            %
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </ResponsiveContainer>
          </section>
        </>
      ) : (
        <>
          <Loading relative text="Calculating" />
        </>
      )}
      {showAdvanced && (
        <DonorRecipients startDate={startDate} endDate={endDate} />
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
