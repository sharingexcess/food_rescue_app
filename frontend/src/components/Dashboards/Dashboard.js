import { Box, Flex, Text, Spinner, Select } from '@chakra-ui/react'
import { useAuth, useApi, useIsMobile } from 'hooks'
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

const COLORS = [
  '#0e7530',
  '#6C9A8B',
  '#4ea528',
  '#6bcf3f',
  '#8af55c',
  '#e6b872',
  '#31834d',
  '#AA3C3B',
]

export function Dashboard() {
  const [totalCollectionWeight, setTotalCollectionWeight] = useState(0)
  const [org, setOrg] = useState()
  const [startDate, setStartDate] = useState(new Date(getDefaultRangeStart()))
  const [endDate, setEndDate] = useState(new Date(getDefaultRangeEnd()))
  const [dateRangeOption, setDateRangeOption] = useState('1 month')
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [orgData, setorgData] = useState([])
  const { donor_id } = useParams()
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const [visualizationType, setVisualizationType] = useState('pieChart') // new state to manage selected visualization

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
    if (collections) {
      let totalWeight = 0
      collections.forEach(collection => {
        totalWeight += collection.total_weight
      })

      setTotalCollectionWeight(totalWeight)

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

      const newOrgData = Object.entries(aggregatedData).map(
        ([name, value]) => ({
          name,
          value,
        })
      )
      setorgData(newOrgData)
      setIsStatsLoading(false)
      setIsLoading(false)
    }
  }, [collections])

  useEffect(() => {
    if (organization && collections) {
      setOrg(organization)
    }
  }, [organization, collections])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].name} : ${payload[0].value} lbs`}</p>
        </div>
      )
    }
    return null
  }

  const renderVisualization = () => {
    switch (visualizationType) {
      case 'pieChart':
        return (
          <PieChart width={400} height={400}>
            <Pie
              data={orgData}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {orgData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={10} />
          </PieChart>
        )
      case 'table':
        return (
          <Box width={400} mt={30}>
            <table id="Analytics-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', width: '40%' }}>Name</th>
                  <th style={{ textAlign: 'right', width: '30%' }}>
                    Total Weight
                  </th>
                  <th style={{ textAlign: 'right', width: '30%' }}>
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {orgData.map((row, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'left', width: '40%' }}>
                      {row.name}
                    </td>
                    <td style={{ textAlign: 'right', width: '30%' }}>
                      {formatLargeNumber(row.value)} lbs.
                    </td>
                    <td style={{ textAlign: 'right', width: '30%' }}>
                      {((100 * row.value) / totalCollectionWeight).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <>
      <PageTitle align={isMobile ? 'center' : ''}>
        {org ? org.name : 'Loading...'}
      </PageTitle>
      <Box
        display={isMobile ? 'flex' : ''}
        justifyContent={isMobile ? 'center' : ''}
      >
        <Select
          value={dateRangeOption}
          width={300}
          onChange={e => {
            const value = e.target.value
            setDateRangeOption(value)
            setIsStatsLoading(true)
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
                  new Date(
                    currentDate.setFullYear(currentDate.getFullYear() - 1)
                  )
                )
                setEndDate(new Date())
                break
              case 'custom':
                setStartDate(new Date(getDefaultRangeStart()))
                setEndDate(new Date(getDefaultRangeEnd()))
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
      </Box>

      {dateRangeOption === 'custom' && (
        <Flex marginTop={2} gap="4" justify="space-between" mb="4">
          <Box>
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
          <Box>
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

      {isStatsLoading ? (
        <Flex justifyContent="center" alignItems="center" minHeight="14vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <Flex
            direction="column"
            align={isMobile ? 'center' : 'start'}
            marginTop={10}
          >
            <Text fontSize="md" color="element.tertiary">
              <Text
                fontSize="2xl"
                as="span"
                fontWeight="700"
                color="element.primary"
              >
                {formatLargeNumber(totalCollectionWeight)}
              </Text>{' '}
              lbs. food rescued
            </Text>
            <Text
              fontSize="md"
              color="element.tertiary"
              textAlign={isMobile ? 'center' : ''}
            >
              <Text
                fontSize="2xl"
                as="span"
                fontWeight="700"
                color="element.primary"
              >
                {formatLargeNumber(
                  (totalCollectionWeight * EMISSIONS_COEFFICIENT).toFixed(2)
                )}
              </Text>{' '}
              lbs. carbon emissions avoided
            </Text>
          </Flex>
        </>
      )}

      {isLoading ? (
        <></>
      ) : (
        <Box
          w="100%"
          minHeight="400px"
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          flexDirection={'column'}
        >
          <Flex display={'flex'} flexDirection={'column'}>
            {renderVisualization()}
          </Flex>
          <Select
            value={visualizationType}
            onChange={e => setVisualizationType(e.target.value)}
            width={200}
            mt={6}
          >
            <option value="pieChart">Pie Chart</option>
            <option value="table">Data Table</option>
          </Select>
        </Box>
      )}
    </>
  )
}
