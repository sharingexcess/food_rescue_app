import {
  Box,
  Flex,
  VStack,
  Image,
  Text,
  Badge,
  Heading,
  Divider,
} from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import { getDefaultRangeStart, getDefaultRangeEnd } from './Analytics.utils'
import { useApi } from 'hooks'
import DatePicker from 'react-datepicker'
import { mapdata } from './topo.js'

import {
  calculateTotalWholesaleWeight,
  calculateTotalRetailWeight,
  breakdownByDonorType,
  getGeneralPieChart,
  aggregateWeights,
  getIncomingFoodChartData,
  toPieChartDataForWeight,
  aggregateWeightsByOrganization,
  sortedOrganizationsByWeight,
  getOrganizationsBySortedWeights,
  aggregateWeightsByLocation,
  calculateMetrics,
} from './helper'

import { Pie, Geomap } from 'd3plus-react'

export function AdvancedAnalytics() {
  const search = new URLSearchParams(window.location.search)
  const [pieData, setPieData] = useState([])
  const [incomingFoodPieData, setIncomingFoodPieData] = useState([])
  const [donatedFoodPieData, setDonatedFoodPieData] = useState([])
  const [cumulativeMetrics, setCumulativeMetrics] = useState([])
  const [startDate, setStartDate] = useState(new Date(getDefaultRangeStart()))
  const [endDate, setEndDate] = useState(new Date(getDefaultRangeEnd()))

  // State variables to hold the different types
  const [wholesaleRescues, setWholesaleRescues] = useState([])
  const [retailRescues, setRetailRescues] = useState([])
  const [directLinkRescues, setDirectLinkRescues] = useState([])
  const [collectionTransfers, setcollectionTransfers] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [distributionTransfers, setdistributionTransfers] = useState([])
  const [locations, setLocations] = useState([])

  const [breakdown] = useState(
    search.get('breakdown')
      ? decodeURIComponent(search.get('breakdown'))
      : 'Food Category'
  )

  const [
    collectionOrganizationsBySortedWeights,
    setCollectionOrganizationsBySortedWeights,
  ] = useState([])
  const [
    distributionOrganizationsBySortedWeights,
    setDistributionOrganizationsBySortedWeights,
  ] = useState([])
  const [
    incomingFoodAggregatedWeightsByLocation,
    setIncomingFoodAggregatedWeightsByLocation,
  ] = useState([])

  const [apiData, setApiData] = useState(null)

  const params = useMemo(
    () => ({
      date_range_start: startDate,
      date_range_end: endDate,
      breakdown,
      analyticsType: 'advanced',
    }),
    [startDate, endDate, breakdown]
  )

  const { data: freshApiData } = useApi('/analytics', params)

  useEffect(() => {
    if (freshApiData) {
      setApiData(freshApiData)
    }
  }, [freshApiData])

  useEffect(() => {
    if (apiData) {
      setWholesaleRescues(
        apiData.rescues.filter(rescue => rescue.type === 'wholesale')
      )
      setRetailRescues(
        apiData.rescues.filter(rescue => rescue.type === 'retail')
      )
      setDirectLinkRescues(
        apiData.rescues.filter(rescue => rescue.type === 'direct_link')
      )
      setcollectionTransfers(apiData.collections)
      setdistributionTransfers(apiData.distributions)
      setOrganizations(apiData.organizations)
      setLocations(apiData.locations)
    }
  }, [apiData])

  // console logging
  useEffect(() => {
    wholesaleRescues
      ? console.log('Wholesale Rescues:', wholesaleRescues)
      : null

    retailRescues ? console.log('Retail Rescues:', retailRescues) : null

    directLinkRescues
      ? console.log('Direct Link Rescues:', directLinkRescues)
      : null
    collectionTransfers
      ? console.log('Collection Transfers:', collectionTransfers)
      : null
    distributionTransfers
      ? console.log('Distribution Transfers:', distributionTransfers)
      : null
  }, [
    wholesaleRescues,
    retailRescues,
    directLinkRescues,
    collectionTransfers,
    distributionTransfers,
  ])

  useEffect(() => {
    const totalWholesaleWeight = calculateTotalWholesaleWeight(
      wholesaleRescues,
      collectionTransfers
    )
    const totalRetailWeight = calculateTotalRetailWeight(
      retailRescues,
      collectionTransfers
    )

    console.log('Total Wholesale Weight Collection:', totalWholesaleWeight)
    console.log('Total Retail Weight Collection:', totalRetailWeight)
    const categories = breakdownByDonorType(collectionTransfers, organizations)

    const generalPieChartData = getGeneralPieChart(categories)

    setPieData(generalPieChartData)
    console.log('General Pie Chart Data:', generalPieChartData)

    const aggregatedWeights = aggregateWeights(collectionTransfers)
    const incomingFoodChartData = getIncomingFoodChartData(aggregatedWeights)

    setIncomingFoodPieData(incomingFoodChartData) // Assuming setPieData is a state setter for pieData
    console.log('Pie Chart Data for Weight:', incomingFoodChartData)

    const aggregateCollectionWeights =
      aggregateWeightsByOrganization(collectionTransfers)
    const sortedCollectionOrgsByWeight = sortedOrganizationsByWeight(
      aggregateCollectionWeights
    )
    const getCollectionOrgsBySortedWeights = getOrganizationsBySortedWeights(
      sortedCollectionOrgsByWeight,
      organizations
    )

    setCollectionOrganizationsBySortedWeights(
      getCollectionOrgsBySortedWeights.slice(0, 4)
    )
    console.log(
      'Organizations By Sorted Weights:',
      getCollectionOrgsBySortedWeights
    )

    // logLocationsFromTransfers(collectionTransfers, locations)

    const aggregatedWeightsByLocation = aggregateWeightsByLocation(
      collectionTransfers,
      locations,
      organizations
    )
    setIncomingFoodAggregatedWeightsByLocation(aggregatedWeightsByLocation)
    console.log(
      'Aggregated Weights By Location:',
      incomingFoodAggregatedWeightsByLocation
    )

    // Donated food (distribution)
    const distributionAggregatedWeights = aggregateWeights(
      distributionTransfers
    )
    console.log(
      'Distribution Aggregated Weights:',
      distributionAggregatedWeights
    )

    const cumulativeMetrics = calculateMetrics(
      distributionTransfers,
      organizations
    )

    setCumulativeMetrics(cumulativeMetrics)
    console.log('Donation Metrics:', cumulativeMetrics)

    const donatedPieChartDataForWeight = toPieChartDataForWeight(
      distributionAggregatedWeights
    )
    setDonatedFoodPieData(donatedPieChartDataForWeight)

    const aggregateDistributionWeights = aggregateWeightsByOrganization(
      distributionTransfers
    )
    const sortedDistributionOrgsByWeight = sortedOrganizationsByWeight(
      aggregateDistributionWeights
    )
    const getDistributionOriganizationsBySortedWeights =
      getOrganizationsBySortedWeights(
        sortedDistributionOrgsByWeight,
        organizations
      )

    setDistributionOrganizationsBySortedWeights(
      getDistributionOriganizationsBySortedWeights.slice(0, 4)
    )

    // setIncomingFoodPieData(pieChartDataForWeight) // Assuming setPieData is a state setter for pieData
  }, [wholesaleRescues, collectionTransfers])

  const mapConfig = {
    data: mapdata,
    groupBy: 'slug',
    colorScale: 'dma_code',
    label: d => d.city + ', ' + d.region,
    point: d => [d.longitude, d.latitude],
    pointSize: d => d.dma_code,
    pointSizeMin: 1,
    pointSizeMax: 10,
  }

  return (
    <Box>
      <Flex gap="4" justify="space-between" mb="4" flexDirection={'column'}>
        <Flex gap="4" justify="space-between" mb="4">
          <Box>
            <Text fontWeight="600" color="element.tertiary">
              From
            </Text>
            <DatePicker
              selected={startDate}
              onChange={date => {
                setStartDate(date)
              }}
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
              onChange={date => {
                setEndDate(date)
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />
          </Box>
        </Flex>
        <Heading>General Overview</Heading>
        <div style={{ width: '100%', height: '300px' }}>
          <Pie
            config={{
              data: pieData,
              groupBy: 'Type',
              value: 'Percentage',
              size: [300, 300],
              legend: true,
              tooltip: true,
              tooltipConfig: {
                tbody: [
                  ['Type', d => d.Type],
                  ['PCT', d => `${d.Percentage}%`],
                ],
              },
            }}
          />
        </div>
        <Flex>
          {cumulativeMetrics ? (
            <Flex direction="column">
              <Text>
                <strong>Total Weight:</strong> {cumulativeMetrics.total_weight}{' '}
                lbs
              </Text>
              <Text>
                <strong>Retail Value:</strong> $
                {cumulativeMetrics.retail_value
                  ? cumulativeMetrics.retail_value.toFixed(2)
                  : 0}
              </Text>
              <Text>
                <strong>Fair Market Value:</strong> $
                {cumulativeMetrics.fair_market_value
                  ? cumulativeMetrics.fair_market_value.toFixed(2)
                  : 0}
              </Text>
              <Text>
                <strong>Emissions Reduced:</strong>{' '}
                {cumulativeMetrics.emissions_reduced
                  ? cumulativeMetrics.emissions_reduced.toFixed(2)
                  : 0}{' '}
                CO2e
              </Text>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
      <Divider />

      <Flex
        gap="4"
        justify="space-between"
        mb="4"
        flexDirection={'column'}
        mt={8}
      >
        <Heading>Incoming Food</Heading>
        <div style={{ width: '100%', height: '300px' }}>
          <Pie
            config={{
              data: incomingFoodPieData,
              groupBy: 'Type',
              value: 'Percentage',
              size: [300, 300],
              legend: true,
              tooltip: true,
              tooltipConfig: {
                tbody: [
                  ['Type', d => d.Type],
                  ['PCT', d => `${d.Percentage}%`],
                ],
              },
            }}
          />

          <VStack align="start" spacing={5} mt={4}>
            <h2>Top Donors</h2>

            {collectionOrganizationsBySortedWeights.map(donor => (
              <Box
                key={donor.id}
                borderWidth="1px"
                borderRadius="lg"
                padding={5}
                width="100%"
                boxShadow="lg"
              >
                <Box display="flex" alignItems="center">
                  <Image
                    boxSize="50px"
                    borderRadius="full"
                    src={
                      donor.dashboard_logo ||
                      'https://uploads-ssl.webflow.com/64515383645eb646d576e1fd/64515383645eb6607b76e285_logo.png'
                    }
                    alt={donor.name}
                    marginRight={3}
                  />
                  <Box>
                    <Text fontSize="xl" fontWeight="bold">
                      {donor.name}
                    </Text>
                    <Text color="gray.500">{donor.subtype}</Text>
                  </Box>
                </Box>

                <Box mt={3}>
                  <Text>
                    Total Weight Donated: {donor.total_weight_donated} lbs
                  </Text>
                  {donor.tags && donor.tags.length > 0 && (
                    <Box mt={2}>
                      {donor.tags.map(tag => (
                        <Badge key={tag} marginRight={2}>
                          {tag}
                        </Badge>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </VStack>

          <Flex
            gap="4"
            justify="space-between"
            mb="4"
            flexDirection={'column'}
            mt={8}
          >
            <Divider />

            <Heading>Donated Food</Heading>
            <div style={{ width: '100%', height: '300px' }}>
              <Pie
                config={{
                  data: donatedFoodPieData,
                  groupBy: 'Type',
                  value: 'Percentage',
                  size: [300, 300],
                  legend: true,
                  tooltip: true,
                  tooltipConfig: {
                    tbody: [
                      ['Type', d => d.Type],
                      ['PCT', d => `${d.Percentage}%`],
                    ],
                  },
                }}
              />
            </div>

            <VStack align="start" spacing={5} mt={4}>
              <h2>Top Recipients</h2>
              {distributionOrganizationsBySortedWeights.map(donor => (
                <Box
                  key={donor.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  padding={5}
                  width="100%"
                  boxShadow="lg"
                >
                  <Box display="flex" alignItems="center">
                    <Image
                      boxSize="50px"
                      borderRadius="full"
                      src={
                        donor.dashboard_logo ||
                        'https://uploads-ssl.webflow.com/64515383645eb646d576e1fd/64515383645eb6607b76e285_logo.png'
                      }
                      alt={donor.name}
                      marginRight={3}
                    />
                    <Box>
                      <Text fontSize="xl" fontWeight="bold">
                        {donor.name}
                      </Text>
                      <Text color="gray.500">{donor.subtype}</Text>
                    </Box>
                  </Box>

                  <Box mt={3}>
                    <Text>
                      Total Weight Donated: {donor.total_weight_donated} lbs
                    </Text>
                    {donor.tags && donor.tags.length > 0 && (
                      <Box mt={2}>
                        {donor.tags.map(tag => (
                          <Badge key={tag} marginRight={2}>
                            {tag}
                          </Badge>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </VStack>
          </Flex>

          <Flex
            gap="8" // Increased gap
            mt={12} // Increased margin top
            justify="space-between"
            mb="8" // Increased margin bottom
            flexDirection={'column'}
            padding="4" // Added padding
          >
            <Heading fontSize="2xl">
              Geo Stats / Comparative Stats / What-if analysis
            </Heading>
            <div style={{ width: '100%', height: '500px' }}>
              <Geomap config={mapConfig} />
            </div>
          </Flex>
        </div>
      </Flex>
    </Box>
  )
}
