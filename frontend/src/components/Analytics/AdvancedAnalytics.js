import { Box, Flex, Text } from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import { getDefaultRangeStart, getDefaultRangeEnd } from './Analytics.utils'
import { endOfDay, startOfDay } from './helper'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useApi, useIsMobile } from 'hooks'
import Select from 'react-select'

import { AdvancedAnalyticsTable } from './AdvanvedAnalyticsTable'

export function AdvancedAnalytics() {
  const [startDate, setStartDate] = useState(new Date(getDefaultRangeStart()))
  const [endDate, setEndDate] = useState(new Date(getDefaultRangeEnd()))
  const isMobile = useIsMobile()

  const rescueTypeOptions = [
    { value: 'retail', label: 'Retail' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'direct_link', label: 'Direct Link' },
  ]

  const transferTypeOptions = [
    { value: 'collection', label: 'Collection' },
    { value: 'distribution', label: 'Distribution' },
  ]

  const tags = []

  const [selectedHandler, setSelectedHandler] = useState(null)
  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [setSelectedRescueType] = useState(null)
  const [selectedTags, setSelectedTags] = useState(null)
  const [selectedType, setSelectedType] = useState('distribution')

  const [all_transfers, setAllTransfers] = useState(null)
  const [real_impact_transfers, setRealImpactTransfers] = useState(null)

  const handleRescueTypeChange = option => setSelectedRescueType(option)

  const handleTypeChange = option => {
    setSelectedType(option.value)
  }

  const customStyles = {
    control: provided => ({
      ...provided,
      width: 200, // Set fixed width here
    }),
    option: provided => ({
      ...provided,
      color: 'black',
    }),
    singleValue: provided => ({
      ...provided,
      color: 'black',
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
        label: handler.name,
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
      for (const org of organizations) {
        const orgTags = org.tags
        if (orgTags) {
          for (const tag of orgTags) {
            tags.push({ value: tag, label: tag })
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
      setAllTransfers(transfers.total_transfers)
      setRealImpactTransfers(transfers.filtered_transfers)
    }
  }, [transfers])

  // when tags change filter all transfers by tags

  const handleTagsChange = option => {
    setSelectedTags(option)
  }

  useEffect(() => {
    if (selectedTags) {
      const filtered = []

      if (real_impact_transfers && selectedTags.length > 0) {
        for (const transfer of real_impact_transfers) {
          const org = organizations.find(
            org => org.id === transfer.organization_id
          )
          if (org) {
            const orgTags = org.tags
            if (orgTags) {
              for (const tag of orgTags) {
                if (selectedTags.map(tag => tag.value).includes(tag)) {
                  filtered.push(transfer)
                  break // Breaks the loop once a matching tag is found
                }
              }
            }
          }
        }
        setRealImpactTransfers(filtered)
      } else {
        if (transfers) {
          setRealImpactTransfers(transfers.filtered_transfers)
        }
      }
    }
  }, [selectedTags])

  const handleHandlerChange = option => {
    setSelectedHandler(option)
  }

  useEffect(() => {
    if (selectedHandler) {
      const filtered = []
      const selected_handler_id = selectedHandler.value

      if (real_impact_transfers) {
        for (const transfer of real_impact_transfers) {
          if (transfer.handler_id == selected_handler_id) {
            filtered.push(transfer)
          }
        }
        setRealImpactTransfers(filtered)
      }
    } else {
      if (transfers) {
        setRealImpactTransfers(transfers.filtered_transfers)
      }
    }
  }, [selectedHandler])

  // organization
  const handleOrganizationChange = option => {
    setSelectedOrganization(option)
  }

  useEffect(() => {
    if (selectedOrganization) {
      const filtered = []
      const selected_organization_id = selectedOrganization.value

      if (real_impact_transfers) {
        for (const transfer of real_impact_transfers) {
          if (transfer.organization_id == selected_organization_id) {
            filtered.push(transfer)
          }
        }
        setRealImpactTransfers(filtered)
      }
    } else {
      if (transfers) {
        setRealImpactTransfers(transfers.filtered_transfers)
      }
    }
  }, [selectedOrganization])

  return (
    <>
      <Flex
        gap="4"
        justify="space-between"
        mb="4"
        flexDirection={isMobile ? 'column' : 'row'}
      >
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
            placeholder="Organization"
            isSearchable
            isClearable
            styles={customStyles}
            onChange={handleOrganizationChange}
          />
        </Box>
        <Box>
          <Select
            options={rescueTypeOptions}
            placeholder="Rescue Type"
            isSearchable
            isClearable
            styles={customStyles}
            onChange={handleRescueTypeChange}
          />
        </Box>
      </Flex>
      <Flex flexDirection={'row'} justifyContent={'space-between'}>
        <Box>
          <Text fontWeight="600" color="element.tertiary">
            Tags
          </Text>
          <Select
            options={tags}
            placeholder="Tags"
            isSearchable
            isClearable
            isMulti
            styles={{
              control: provided => ({ ...provided, width: 400 }),
            }}
            onChange={handleTagsChange}
          />
        </Box>
        <Box>
          <Text fontWeight="600" color="element.tertiary">
            Type
          </Text>
          <Select
            options={transferTypeOptions}
            onChange={handleTypeChange}
            defaultValue={transferTypeOptions[1]}
            placeholder="Transfer Type"
            styles={customStyles}
          />
        </Box>
      </Flex>
      <Flex mt={8}>
        {transfers ? (
          <Text>
            <b>
              {all_transfers ? all_transfers.length : null}{' '}
              {selectedType === 'distribution'
                ? 'distributions'
                : 'collections'}{' '}
            </b>
            |{' '}
            {all_transfers
              ? all_transfers
                  .reduce((total, current) => total + current.total_weight, 0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              : null}{' '}
            lbs. total weight |{' '}
            {real_impact_transfers
              ? real_impact_transfers
                  .reduce((total, current) => total + current.total_weight, 0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              : null}{' '}
            lbs. real impact
          </Text>
        ) : (
          <Text>Loading impact data...</Text>
        )}
      </Flex>
      {transfers ? (
        <AdvancedAnalyticsTable
          real_impact_transfers={
            real_impact_transfers ? real_impact_transfers : null
          }
        />
      ) : (
        <Text>Loading data table...</Text>
      )}
    </>
  )
}
