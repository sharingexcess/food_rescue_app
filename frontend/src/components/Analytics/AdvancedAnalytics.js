import { Box, Flex, Text, Button } from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import { getDefaultRangeStart, getDefaultRangeEnd } from './Analytics.utils'
import { endOfDay, startOfDay } from './helper'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useApi, useIsMobile } from 'hooks'
import Select from 'react-select'
import { Loading } from 'components'
import { AdvancedAnalyticsTable } from './AdvanvedAnalyticsTable'

export function AdvancedAnalytics() {
  const [selectedStartDate, setSelectedStartDate] = useState(
    new Date(getDefaultRangeStart())
  )
  const [selectedEndDate, setSelectedEndDate] = useState(
    new Date(getDefaultRangeEnd())
  )
  const [startDate, setStartDate] = useState(selectedStartDate)
  const [endDate, setEndDate] = useState(selectedEndDate)
  const isMobile = useIsMobile()

  const rescueTypeOptions = [
    { value: 'retail', label: 'Retail' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'direct_link', label: 'Direct Link' },
  ]

  const transferTypeOptions = [
    { value: 'distribution', label: 'Distribution' },
    { value: 'collection', label: 'Collection' },
  ]

  const tags = []

  const [selectedHandler, setSelectedHandler] = useState(null)
  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [selectedRescueType, setSelectedRescueType] = useState(null)
  const [selectedTags, setSelectedTags] = useState(null)
  const [selectedType, setSelectedType] = useState('distribution')

  const [real_impact_transfers, setRealImpactTransfers] = useState(null)
  const [rescues, setRescues] = useState(null)
  const [locations, setLocations] = useState(null)
  const [orgSubtypes, setOrgSubtypes] = useState(null)

  const handleTypeChange = option => {
    setSelectedType(option.value)
  }

  const handleApplyClick = () => {
    setStartDate(selectedStartDate)
    setEndDate(selectedEndDate)
  }

  const customStyles = {
    control: provided => ({
      ...provided,
      width: 200, // Set fixed width here
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

  const { data: handlers } = useApi(
    '/public_profiles/list',
    useMemo(() => ({}), [])
  )

  const { data: organizations } = useApi(
    '/organizations/list',
    useMemo(
      () => ({ type: selectedType === 'distribution' ? 'recipient' : 'donor' }),
      [selectedType]
    )
  )

  const handlerOptions = useMemo(() => {
    if (handlers) {
      return handlers.map(handler => ({
        value: handler.id,
        label: handler.name + ' : ' + handler.email,
        email: handler.email,
      }))
    }
    return []
  }, [handlers])

  const organizationOptions = useMemo(() => {
    if (organizations) {
      return organizations.map(organization => ({
        value: organization.id,
        label: organization.name,
      }))
    }
    return []
  }, [organizations])

  useEffect(() => {
    if (organizations) {
      for (const organization of organizations) {
        if (organization.tags) {
          for (const tag of organization.tags) {
            if (!tags.map(tag => tag.value).includes(tag)) {
              tags.push({ value: tag, label: tag })
            }
          }
        }
      }
    }
  }, [organizations, tags])

  const params = useMemo(
    () => ({
      date_range_start: startOfDay(startDate),
      date_range_end: endOfDay(endDate),
      breakdown: 'Food Category',
      analyticsType: 'advancedAnalytics',
      transferType: selectedType,
    }),
    [startDate, endDate, selectedType]
  )

  const { data: transfers } = useApi('/analytics', params)

  useEffect(() => {
    if (transfers) {
      setRealImpactTransfers(transfers.total_transfers.reverse())
      setLocations(transfers.locations)
      setRescues(transfers.rescues)
    }
  }, [transfers])

  const handleTagsChange = option => {
    setSelectedTags(option)
  }

  const handleHandlerChange = option => {
    setSelectedHandler(option)
  }

  const handleOrganizationChange = option => {
    setSelectedOrganization(option)
  }

  const handleRescueTypeChange = option => {
    setSelectedRescueType(option)
  }

  useEffect(() => {
    let filteredTransfers = transfers ? [...transfers.total_transfers] : []

    // Filter by handler
    if (selectedHandler) {
      const selected_handler_id = selectedHandler.value
      filteredTransfers = filteredTransfers.filter(
        transfer => transfer.handler_id === selected_handler_id
      )
    }

    // Filter by organization
    if (selectedOrganization) {
      const selected_organization_id = selectedOrganization.value
      filteredTransfers = filteredTransfers.filter(
        transfer => transfer.organization_id === selected_organization_id
      )
    }

    // Filter by tags
    if (selectedTags) {
      const selected_tag = selectedTags.value
      if (organizations) {
        filteredTransfers = filteredTransfers.filter(transfer => {
          const org = organizations.find(
            org => org.id === transfer.organization_id
          )
          return org && org.tags && org.tags.includes(selected_tag)
        })
      } else {
        console.log('organizations is null')
      }
    }

    // Filter by rescue type
    if (selectedRescueType) {
      const selected_rescue_type = selectedRescueType.value
      if (rescues) {
        filteredTransfers = filteredTransfers.filter(transfer => {
          const rescue = rescues.find(
            rescue => rescue.id === transfer.rescue_id
          )
          return rescue && rescue.type === selected_rescue_type
        })
      } else {
        console.log('rescues is null')
      }
    }

    setRealImpactTransfers(filteredTransfers)
  }, [
    selectedHandler,
    selectedTags,
    selectedOrganization,
    selectedRescueType,
    transfers,
    organizations,
    rescues,
  ])

  const isEligibleOrg = orgSubtype =>
    !['holding', 'compost'].includes(orgSubtype)

  useEffect(() => {
    if (organizations) {
      const orgSubtypes = new Map(organizations.map(o => [o.id, o.subtype]))
      setOrgSubtypes(orgSubtypes)
    }
  }, [organizations])

  return (
    <>
      <Flex
        direction={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'flex-end'}
        gap="4"
        justify="space-between"
        mb="4"
        width={'100%'}
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
      <Flex
        flexDirection={isMobile ? 'row' : 'column'}
        justify="space-between"
        mb="4"
      >
        <Flex
          gap="4"
          justify="space-between"
          mb="4"
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <Box>
            <Select
              options={handlerOptions}
              placeholder="Handler"
              isSearchable
              isClearable
              styles={customStyles}
              onChange={handleHandlerChange}
            />
          </Box>
          <Box>
            <Select
              options={organizationOptions}
              onChange={handleOrganizationChange}
              placeholder="Organization"
              isClearable
              styles={customStyles}
            />
          </Box>
          <Box>
            <Select
              options={rescueTypeOptions}
              onChange={handleRescueTypeChange}
              placeholder="Rescue Type"
              isClearable
              styles={customStyles}
            />
          </Box>
        </Flex>
        <Flex
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent={isMobile ? '' : 'space-between'}
          ml={isMobile ? 2 : 0}
          gap={isMobile ? 4 : 6}
        >
          <Box>
            <Select
              options={tags}
              placeholder="Tags"
              isSearchable
              isClearable
              styles={{
                control: provided => ({
                  ...provided,
                  width: isMobile ? 200 : 445,
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
              }}
              onChange={handleTagsChange}
            />
          </Box>
          <Select
            options={transferTypeOptions}
            onChange={handleTypeChange}
            defaultValue={transferTypeOptions[0]}
            placeholder="Transfer Type"
            styles={customStyles}
          />
        </Flex>
      </Flex>
      <Flex mt={8}>
        {transfers ? (
          <Flex flexDirection={'column'}>
            <Text fontSize={'lg'} mb={4}>
              <b>
                {real_impact_transfers ? real_impact_transfers.length : null}{' '}
                {selectedType === 'distribution'
                  ? 'distributions'
                  : 'collections'}{' '}
              </b>
              |{' '}
              {real_impact_transfers
                ? real_impact_transfers
                    .reduce((total, current) => total + current.total_weight, 0)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : null}{' '}
              lbs. total weight |{' '}
              <b>
                {real_impact_transfers
                  ? real_impact_transfers
                      .filter(
                        i =>
                          orgSubtypes &&
                          isEligibleOrg(orgSubtypes.get(i.organization_id))
                      )
                      .reduce(
                        (total, current) => total + current.total_weight,
                        0
                      )
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : null}{' '}
                lbs.
              </b>{' '}
              real impact
            </Text>
          </Flex>
        ) : (
          <> </>
        )}
      </Flex>
      {transfers ? (
        <AdvancedAnalyticsTable
          real_impact_transfers={
            real_impact_transfers ? real_impact_transfers : null
          }
          organizations={organizations ? organizations : null}
          locations={locations ? locations : null}
          handlers={handlers ? handlers : null}
        />
      ) : (
        <Loading />
      )}
    </>
  )
}
