import { Box, Flex, Text, Spinner, Select } from '@chakra-ui/react'
import { useAuth, useApi } from 'hooks'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { formatLargeNumber } from 'helpers'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  getDefaultRangeStart,
  getDefaultRangeEnd,
} from '../Analytics/Analytics.utils'
import { EMISSIONS_COEFFICIENT } from '../../helpers'

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

export function Dashboard() {
  const [totalDistributionWeight, setTotalDistributionWeight] = useState(0)
  const [totalCollectionWeight, setTotalCollectionWeight] = useState(0)
  const [org, setOrg] = useState()
  const [startDate, setStartDate] = useState(new Date(getDefaultRangeStart()))
  const [endDate, setEndDate] = useState(new Date(getDefaultRangeEnd()))
  const [dateRangeOption, setDateRangeOption] = useState('1 month')
  const [isLoading, setIsLoading] = useState(true)
  const { donor_id } = useParams()
  const { user } = useAuth()

  const { data: organization } = useApi(
    `/organizations/get/${donor_id}`,
    useMemo(() => ({ type: 'donor' }), [])
  )

  const { data: organizations } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'donor' }), [])
  )

  function getDashboardAccess() {
    if (organizations) {
      for (const org of organizations) {
        const dashboard_access = org.dashboard_access
        if (dashboard_access) {
          if (dashboard_access.includes(user.email)) {
            localStorage.setItem('se_dashboard_access', true)
            return true
          }
        }
      }
    }
    localStorage.setItem('se_dashboard_access', false)
    return false
  }

  getDashboardAccess()

  const { data: distributions } = useApi(
    '/transfers/list',
    useMemo(
      () => ({
        status: 'completed',
        type: 'distribution',
        organization_id: donor_id,
        date_range_start: startDate,
        date_range_end: endDate,
      }),
      [startDate, endDate, donor_id]
    )
  )

  const { data: collections } = useApi(
    '/transfers/list',
    useMemo(
      () => ({
        status: 'completed',
        type: 'collection',
        organization_id: donor_id,
        date_range_start: startDate,
        date_range_end: endDate,
      }),
      [startDate, endDate, donor_id]
    )
  )

  useEffect(() => {
    if (distributions) {
      let totalWeight = 0
      distributions.forEach(distribution => {
        totalWeight += distribution.total_weight
      })

      setTotalDistributionWeight(totalWeight)
    }
  })

  useEffect(() => {
    if (collections) {
      let totalWeight = 0
      collections.forEach(collection => {
        totalWeight += collection.total_weight
      })

      setTotalCollectionWeight(totalWeight)
    }
  })

  useEffect(() => {
    if (organization && distributions && collections) {
      setOrg(organization)
      setIsLoading(false)
    }
  }, [organization, distributions, collections])

  const generatePieData = () => {
    if (!collections) return []
    const aggregatedData = {}

    collections.forEach(collection => {
      Object.entries(collection.categorized_weight).forEach(
        ([category, weight]) => {
          if (!aggregatedData[category]) {
            aggregatedData[category] = 0
          }
          aggregatedData[category] += weight
        }
      )
    })

    return Object.entries(aggregatedData).map(([name, value]) => ({
      name,
      value,
    }))
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].name} : ${payload[0].value} lbs`}</p>
        </div>
      )
    }
    return null
  }

  const COLORS = [
    '#4CAF50',
    '#307e0e',
    '#4ea528',
    '#6bcf3f',
    '#8af55c',
    '#b8ff9a',
  ]
  const pieData = generatePieData()

  return (
    <>
      <PageTitle>{org ? org.name : 'Loading dashboard...'}</PageTitle>
      <Select
        value={dateRangeOption}
        width={300}
        onChange={e => {
          const value = e.target.value
          setDateRangeOption(value)
          const currentDate = new Date()
          switch (value) {
            case '1 month':
              setStartDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1))
              )
              setEndDate(new Date())
              break
            case '3 months':
              setStartDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 3))
              )
              setEndDate(new Date())
              break
            case '6 months':
              setStartDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 6))
              )
              setEndDate(new Date())
              break
            case '1 year':
              setStartDate(
                new Date(currentDate.setFullYear(currentDate.getFullYear() - 1))
              )
              setEndDate(new Date())
              break
            case 'custom':
              break
            default:
              break
          }
        }}
      >
        <option value="1 month">Last month</option>
        <option value="3 months">3 months</option>
        <option value="6 months">6 months</option>
        <option value="1 year">1 year</option>
        <option value="custom">Choose Date</option>
      </Select>

      {dateRangeOption === 'custom' && (
        <Flex marginTop={2} gap="4" justify="space-between" mb="4">
          <Box w="100%">
            <Text fontWeight="600" color="element.tertiary">
              From
            </Text>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
          </Box>
          <Box w="100%">
            <Text fontWeight="600" color="element.tertiary">
              To
            </Text>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />
          </Box>
        </Flex>
      )}

      <Flex direction="column" align="start" marginTop={10}>
        <Text fontSize="xl" color="element.tertiary">
          <Text as="span" fontWeight="700" color="element.primary">
            {formatLargeNumber(totalCollectionWeight)}
          </Text>{' '}
          lbs. Food Rescued
        </Text>
        <Text fontSize="xl" color="element.tertiary">
          <Text as="span" fontWeight="700" color="element.primary">
            {totalCollectionWeight * EMISSIONS_COEFFICIENT}
          </Text>{' '}
          lbs. GHG removed
        </Text>
      </Flex>

      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" minHeight="50vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box w="100%" h="400px" display={'flex'} justifyContent={'center'}>
          <Flex align={'center'}>
            {pieData && pieData.length > 0 && (
              <PieChart width={400} height={400}>
                <Pie
                  data={pieData}
                  cx={200}
                  cy={200}
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} />
              </PieChart>
            )}
          </Flex>
        </Box>
      )}
    </>
  )
}
