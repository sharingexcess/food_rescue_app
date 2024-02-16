import { Box, Flex, Text, Spinner, Heading, Select } from '@chakra-ui/react'
import {
  getDefaultRangeStart,
  getDefaultRangeEnd,
} from '../../Analytics/Analytics.utils'
import { useApi, useIsMobile } from 'hooks'
import { useEffect, useState, useMemo } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { startOfDay, endOfDay } from '../../Analytics/helper'
import DatePicker from 'react-datepicker'
import ReactSelect from 'react-select'

import {
  formatLargeNumber,
  RETAIL_VALUES,
  FAIR_MARKET_VALUES,
  EMISSIONS_COEFFICIENT,
  FOOD_CATEGORIES,
} from '../Elements/helper'
import ImpactMap from '../Elements/ImpactMap'

export function CityImpact() {
  const isMobile = useIsMobile()
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  const [startDate, setStartDate] = useState(new Date(currentYear, 0, 1))
  const [endDate, setEndDate] = useState(new Date(currentYear + 1, 0, 1))

  const [distributions, setDistributions] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [locations, setLocations] = useState([])
  const [philadelphiDistributions, setPhiladelphiaDistributions] = useState([])
  const [recipientsMapData, setRecipientsMapData] = useState([])
  const [philadelphiaMetrics, setPhiladelphiaMetrics] = useState([])
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('Philadelphia')
  const [states, setStates] = useState([])
  const [selectedState, setSelectedState] = useState(null)

  const [sortedRecipients, setSortedRecipients] = useState([])

  const [dateRangeOption, setDateRangeOption] = useState('This Year')

  const params = useMemo(
    () => ({
      date_range_start: startOfDay(startDate),
      date_range_end: endOfDay(endDate),
      breakdown: 'Food Category',
      analyticsType: 'advancedAnalytics',
      transferType: 'distribution',
      fetchRescues: 'false',
      fetchOrganizations: 'true',
    }),
    [startDate, endDate]
  )

  const { data: advanedApiData, loading } = useApi('/analytics', params)

  useEffect(() => {
    if (advanedApiData) {
      setDistributions(advanedApiData.total_transfers)
      setOrganizations(advanedApiData.organizations)
      setLocations(advanedApiData.locations)
    }
  }, [advanedApiData])

  // set all unique cities
  useEffect(() => {
    if (locations) {
      const uniqueCities = new Set()
      const uniqueStates = new Set()

      locations.forEach(location => {
        if (location.city) {
          uniqueCities.add(location.city)
        }

        if (location.state) {
          uniqueStates.add(location.state)
        }
      })

      const formattedCities = Array.from(uniqueCities).map(city => ({
        value: city,
        label: city,
      }))
      setCities(formattedCities)

      const formattedStates = Array.from(uniqueStates).map(state => ({
        value: state,
        label: state,
      }))
      setStates(formattedStates)
    }
  }, [locations])

  const locationsMap = useMemo(
    () => new Map(locations?.map(l => [l.id, l])),
    [locations]
  )
  const orgsMap = useMemo(
    () => new Map(organizations?.map(o => [o.id, o])),
    [organizations]
  )

  const isEligibleOrg = orgSubtype =>
    !['holding', 'compost'].includes(orgSubtype)

  useEffect(() => {
    if (!distributions || (distributions.length === 0 && !organizations)) return

    const phillyDistributions = []
    const recipientsMap = new Map()

    const updateRecipient = (orgId, weight, location) => {
      const org = orgsMap.get(orgId)
      if (org) {
        const current = recipientsMap.get(org.name) || {
          total_weight: 0,
          zipcode: null,
        }
        recipientsMap.set(org.name, {
          name: org.name,
          total_weight: current.total_weight + weight,
          lat: location?.lat,
          lng: location?.lng,
          city: location?.city,
        })
      }
    }

    distributions.forEach(distribution => {
      const location = locationsMap.get(distribution.location_id)
      const organization = orgsMap.get(distribution.organization_id)

      if (
        distribution.status === 'completed' &&
        organization &&
        isEligibleOrg(organization.subtype) &&
        ((!selectedCity && !selectedState) ||
          (selectedCity && location?.city === selectedCity) ||
          (selectedState && location?.state === selectedState))
      ) {
        phillyDistributions.push(distribution)

        updateRecipient(
          distribution.organization_id,
          distribution.total_weight,
          location
        )
      }
    })

    setPhiladelphiaDistributions(phillyDistributions)
    setRecipientsMapData(recipientsMap)
  }, [distributions, selectedCity, selectedState])

  useEffect(() => {
    let totalWeight = 0,
      retailValue = 0,
      fairMarketValue = 0,
      emissionsReduced = 0

    for (const distribution of philadelphiDistributions) {
      totalWeight += distribution.total_weight
      for (const category of FOOD_CATEGORIES) {
        const categoryWeight = distribution.categorized_weight[category] || 0
        emissionsReduced += categoryWeight * EMISSIONS_COEFFICIENT
        retailValue += categoryWeight * RETAIL_VALUES[category]
        fairMarketValue += categoryWeight * FAIR_MARKET_VALUES[category]
      }
    }

    const meals_provided = parseInt(totalWeight * 0.8)

    const metrics = {
      total_weight: totalWeight,
      retail_value: retailValue,
      fair_market_value: fairMarketValue,
      emissions_reduced: emissionsReduced,
      meals_provided,
    }

    setPhiladelphiaMetrics(metrics)
  }, [philadelphiDistributions])

  useEffect(() => {
    const sortedRecipients = Array.from(recipientsMapData.values()).sort(
      (a, b) => b.total_weight - a.total_weight
    )
    setSortedRecipients(sortedRecipients)
  }, [recipientsMapData])

  useEffect(() => {
    setPhiladelphiaMetrics([])
  }, [startDate, endDate])

  const customDropdownStyles = {
    control: provided => ({
      ...provided,
      marginTop: 16,
      width: isMobile ? 180 : 200,
    }),
    option: provided => ({
      ...provided,
      color: 'black',
      fontSize: '14px',
    }),
    singleValue: provided => ({
      ...provided,
      color: 'black',
      fontSize: '14px',
    }),
  }

  return (
    <>
      <>
        <Box
          display={'flex'}
          justifyContent={'center'}
          flexDirection={'column'}
          alignItems={isMobile ? 'center' : 'flex-start'}
          mb={10}
        >
          <Box display="flex" justifyContent="center">
            <Heading textAlign="center">
              {selectedCity || selectedState || 'Overall'} Impact
            </Heading>
          </Box>
          <Flex
            flexDirection={isMobile ? 'column' : 'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            <Flex gap="4">
              <ReactSelect
                styles={customDropdownStyles}
                options={cities}
                isSearchable
                isClearable
                onChange={e => {
                  setSelectedCity(e ? e.value : '')
                  setSelectedState('')
                }}
                value={
                  selectedCity
                    ? { value: selectedCity, label: selectedCity }
                    : ''
                }
                placeholder="Select City"
              />
              <ReactSelect
                styles={customDropdownStyles}
                options={states}
                placeholder="Select State"
                isSearchable
                isClearable
                value={
                  selectedState
                    ? { value: selectedState, label: selectedState }
                    : ''
                }
                onChange={e => {
                  setSelectedState(e ? e.value : '')
                  setSelectedCity('')
                }}
              />
            </Flex>
            <Select
              value={dateRangeOption}
              width={150}
              mt="4"
              onChange={e => {
                const value = e.target.value
                setDateRangeOption(value)
                const currentDate = new Date()
                const currentYear = currentDate.getFullYear()
                switch (value) {
                  case 'This Year':
                    setStartDate(new Date(currentYear, 0, 1))
                    setEndDate(new Date(currentYear + 1, 0, 1))
                    break
                  case 'Year 2023':
                    setStartDate(new Date(2023, 0, 1))
                    setEndDate(new Date(2024, 0, 1))
                    break
                  case 'Year 2022':
                    setStartDate(new Date(2022, 0, 1))
                    setEndDate(new Date(2023, 0, 1))
                    break
                  case 'Year 2021':
                    setStartDate(new Date(2021, 0, 1))
                    setEndDate(new Date(2022, 0, 1))
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
              <option value="This Year">This Year</option>
              <option value="Year 2023">Year 2023</option>
              <option value="Year 2022">Year 2022</option>
              <option value="Year 2021">Year 2021</option>
              <option value="custom">Choose Date</option>
            </Select>
          </Flex>
        </Box>

        {dateRangeOption === 'custom' && (
          <Flex gap="16" justify="space-between" mb="4">
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
      </>
      {loading ? (
        <Flex
          direction="column"
          p={5}
          w={'100%'}
          alignItems="center"
          height="fit-content"
        >
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <Flex
            direction="column"
            p={5}
            w={'100%'}
            borderRadius="lg"
            boxShadow="lg"
            alignItems="center"
            height="fit-content"
            bg="#e3e3e3"
            mb={8}
          >
            {[
              {
                label: `Food Distributed`,
                value: philadelphiaMetrics.total_weight,
                color: 'green.500',
              },
              {
                label: `Meals Provided`,
                value: philadelphiaMetrics.meals_provided,
                color: 'purple.500',
              },
              {
                label: 'Carbon Emissions Avoided',
                value: parseInt(philadelphiaMetrics.emissions_reduced),
                color: 'blue.500',
              },
              {
                label: 'Retail Value',
                value: '$ ' + philadelphiaMetrics.retail_value,
                color: 'orange.500',
              },
              {
                label: 'Fair Market Value',
                value: '$ ' + philadelphiaMetrics.fair_market_value,
                color: 'red.500',
              },
            ].map((item, index) => (
              <Box
                key={index}
                py={3}
                display={'flex'}
                alignContent={'center'}
                flexDirection={'column'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                <Text fontSize={'lg'} color="gray.700" fontWeight="medium">
                  {item.label}
                </Text>
                <Text
                  fontSize={isMobile ? '3xl' : '4xl'}
                  fontWeight="bold"
                  color={item.color}
                >
                  {formatLargeNumber(item.value)}{' '}
                  {item.label === 'Meals Provided' ||
                  item.label === 'Retail Value' ||
                  item.label === 'Fair Market Value'
                    ? ''
                    : ' lbs.'}
                </Text>
              </Box>
            ))}
          </Flex>
        </>
      )}

      {loading ? (
        <> </>
      ) : (
        <ImpactMap
          selectedEntity={null}
          sortedEntities={sortedRecipients}
          dashboardType={'donor'}
        />
      )}
    </>
  )
}
