import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  Textarea,
  Button,
  Select,
  Text,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  Spinner,
} from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { Autocomplete } from 'components/Autocomplete/Autocomplete'

import {
  calculateCurrentLoad,
  EMPTY_CATEGORIZED_WEIGHT,
  SE_API,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import moment from 'moment'

import { useApi, useAuth } from 'hooks'

import { useState, useMemo } from 'react'

import { WholesaleAllocationCard } from './WholesaleAllocationCard'

export function WholesaleNewAllocation() {
  const [formData, setFormData] = useState({
    organization: null,
    location: null,
    weight: 0,
    notes: '',
    percent_of_total_dropped: 0,
    timestamp_completed: moment().format('YYYY-MM-DDTHH:mm'),
  })

  const [showEntryCard] = useState(true)
  const [date, setDate] = useState(moment().format('YYYY-MM-DDTHH:mm'))
  const [notes, setNotes] = useState(formData.notes)

  const [filterValue, setFilterValue] = useState('')

  const [selectedTransfers, setSelectedTransfers] = useState([])

  const [allocations, setAllocations] = useState([])

  const { user } = useAuth()

  const [setIsSearching] = useState(false)

  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)

  function handleAllocationUpdate(
    rescue,
    rescue_id,
    handler_id,
    organization_id,
    location_id,
    sliderVal,
    calcWeight,
    remainingPercent
  ) {
    setAllocations(prev => {
      const updated = [...prev]
      const index = updated.findIndex(a => a.rescue_id === rescue_id)
      if (index !== -1) {
        updated[index] = {
          rescue,
          rescue_id,
          handler_id,
          organization_id,
          location_id,
          sliderValue: sliderVal,
          calculatedWeight: calcWeight,
          remaining_percent: remainingPercent,
        }
      } else {
        updated.push({
          rescue,
          rescue_id,
          handler_id,
          organization_id,
          location_id,
          sliderValue: sliderVal,
          calculatedWeight: calcWeight,
          remaining_percent: remainingPercent,
        })
      }
      return updated
    })
  }

  const { data: recipients } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'recipient' }), [])
  )

  const { data: rescues, refresh } = useApi(
    '/rescues/list',
    useMemo(
      () => ({
        type: 'wholesale',
        date_range_start: date,
        date_range_end: date,
      }),
      [date]
    )
  )

  function handleSelectTransfer(transfer, rescue) {
    setSelectedTransfers(prevTransfers => {
      // Check if the rescue is already selected
      if (prevTransfers.some(t => t.rescue.id === rescue.id)) {
        return prevTransfers
      }
      return [...prevTransfers, { transfer, rescue: rescue }]
    })
  }

  function handleRecipientSearch(value) {
    return recipients
      ? recipients
          .filter(i => i.locations?.length)
          .filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
      : []
  }

  function handleSelectRecipient(value) {
    const location = value?.locations?.length === 1 ? value.locations[0] : null
    setFormData({ ...formData, organization: value, location })
  }

  function updateParentDate() {
    setFormData({ ...formData, timestamp_completed: date })
  }

  async function handleSaveAllocation() {
    setIsSaving(true) // Start the saving animation

    try {
      if (allocations) {
        for (let i = 0; i < allocations.length; i++) {
          const payload = {
            type: TRANSFER_TYPES.DISTRIBUTION,
            status: STATUSES.COMPLETED,
            rescue_id: allocations[i].rescue_id,
            handler_id: allocations[i].handler_id,
            organization_id: formData.organization.id,
            location_id: formData.location.id,
            notes: formData.notes,
            timestamp_completed: moment().toISOString(),
            total_weight: Math.round(allocations[i].calculatedWeight),
            categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
            percent_of_total_dropped: Math.round(
              allocations[i].remaining_percent
            ),
          }

          for (const category in allocations[i].rescue.transfers[0]
            .categorized_weight) {
            if (
              allocations[i].rescue.transfers[0].categorized_weight[category]
            ) {
              payload.categorized_weight[category] = payload.total_weight
              break
            }
          }

          const distribution = await SE_API.post(
            '/transfers/create',
            payload,
            user.accessToken
          )

          console.log('Created distribution:', distribution)

          const rescue = allocations[i].rescue

          const updated_rescue = await SE_API.post(
            `/rescues/update/${rescue.id}`,
            {
              id: rescue.id,
              type: rescue.type,
              status: rescue.status,
              handler_id: rescue.handler_id,
              notes: rescue.notes,
              timestamp_scheduled: moment(
                rescue.timestamp_scheduled
              ).toISOString(),
              timestamp_completed: null,
              transfer_ids: [...rescue.transfer_ids, distribution.id],
            },
            user.accessToken
          )

          console.log('Updated rescue:', updated_rescue)

          await updateRescueStatus(rescue, allocations[i].calculatedWeight)

          await toast({
            title: 'All set!',
            description: `Distribution successfull!`,
            status: 'info',
            duration: 2000,
            isClosable: true,
            position: 'top',
          })

          setFormData({
            organization: null,
            location: null,
            weight: 0,
            notes: '',
            percent_of_total_dropped: 0,
            timestamp_completed: moment().format('YYYY-MM-DDTHH:mm'),
          })
          setSelectedTransfers([])
          setAllocations([])
          setNotes('')
          setDate(moment().format('YYYY-MM-DDTHH:mm'))
          refresh()
        }
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong while saving!',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function updateRescueStatus(rescue, calculatedWeight) {
    const donation = rescue?.transfers[0]
    const recipients = rescue?.transfers.slice(1)
    let remainingWeight =
      donation && recipients
        ? donation.total_weight -
          recipients.reduce((total, curr) => total + curr.total_weight, 0)
        : null

    remainingWeight = remainingWeight - calculatedWeight

    if (rescue) {
      const activeTransfers = rescue.transfers.filter(
        transfer => transfer.status !== STATUSES.CANCELLED
      )
      const allTransfersComplete = activeTransfers.every(
        transfer => transfer.status === STATUSES.COMPLETED
      )

      if (
        rescue?.status === STATUSES.ACTIVE &&
        remainingWeight < activeTransfers.length &&
        allTransfersComplete
      ) {
        SE_API.post(
          `/rescues/update/${rescue.id}`,
          {
            id: rescue.id,
            type: rescue.type,
            status: STATUSES.COMPLETED,
            handler_id: rescue.handler_id,
            notes: rescue.notes,
            timestamp_scheduled: moment(
              rescue.timestamp_scheduled
            ).toISOString(),
            timestamp_completed: moment().toISOString(),
            transfer_ids: rescue.transfer_ids,
          },
          user.accessToken
        )
      }
    }
  }

  function handleOnRemove(transfer) {
    setSelectedTransfers(prevTransfers => {
      return prevTransfers.filter(t => t.transfer.id !== transfer.id)
    })
  }

  return (
    <>
      <PageTitle>Distribution Detail</PageTitle>

      <FormControl mt={4} mb={4}>
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          mt="6"
          textTransform="uppercase"
        >
          Date
        </Text>
        <Input
          type="datetime-local"
          fontSize="sm"
          value={date}
          onChange={e => setDate(e.target.value)}
          onBlur={updateParentDate}
          mb="6"
        />
      </FormControl>

      <Autocomplete
        label="Recipient Organization"
        placeholder="Name..."
        value={formData.organization}
        setValue={handleSelectRecipient}
        displayField="name"
        handleChange={handleRecipientSearch}
      />

      {formData.organization && (
        <Select
          fontSize="sm"
          my="2"
          placeholder="Choose a location..."
          value={formData.location?.id}
          onChange={e =>
            setFormData({
              ...formData,
              location: formData.organization.locations.find(
                i => i.id === e.target.value
              ),
            })
          }
        >
          {formData.organization?.locations.map(i => (
            <option value={i.id} key={i.id}>
              {i.nickname ? `${i.nickname} (${i.address1})` : i.address1}
            </option>
          ))}
        </Select>
      )}

      {selectedTransfers.map((transfer, index) => (
        <WholesaleAllocationCard
          key={index}
          transfer={transfer.transfer}
          rescue={transfer.rescue}
          onAllocationUpdate={handleAllocationUpdate}
          onRemove={handleOnRemove}
        />
      ))}

      {showEntryCard && (
        <Box
          mt={4}
          borderWidth="1px"
          borderRadius="md"
          padding={4}
          position="relative"
        >
          <FormControl>
            <FormLabel>Select an Entry</FormLabel>
            <Input
              placeholder="Filter by product type or organization name..."
              value={filterValue}
              onChange={e => {
                setFilterValue(e.target.value)
                setIsSearching(e.target.value.trim().length > 0)
              }}
            />
            {rescues &&
              rescues
                .filter(
                  rescue =>
                    !selectedTransfers.some(
                      selTransfer => selTransfer.rescue.id === rescue.id
                    ) &&
                    rescue.transfers.some(
                      transfer =>
                        ((transfer.product_type || '')
                          .toLowerCase()
                          .includes(filterValue.toLowerCase()) ||
                          (transfer.organization.name || '')
                            .toLowerCase()
                            .includes(filterValue.toLowerCase())) &&
                        transfer.type === 'collection'
                    )
                )
                .map(rescue =>
                  rescue.transfers
                    .filter(transfer => transfer.type === 'collection')
                    .map(transfer => {
                      const currentLoad = calculateCurrentLoad(rescue)
                      if (currentLoad === 0) return null // Do not display if the weight is 0

                      return (
                        <Box key={`${rescue.id}-${transfer.id}`}>
                          <Flex
                            key={`${rescue.id}-${transfer.id}`}
                            mb={6}
                            mt={6}
                            onClick={() =>
                              handleSelectTransfer(transfer, rescue)
                            }
                            cursor="pointer"
                          >
                            <Text fontWeight={'bold'} mr={2}>
                              {transfer.product_type}
                            </Text>
                            <Text mr={2} fontWeight={'200'}>
                              | {transfer.organization.name} |
                            </Text>
                            {currentLoad} lbs.
                          </Flex>
                          <Divider />
                        </Box>
                      )
                    })
                )}
          </FormControl>
        </Box>
      )}

      <FormControl mt={4}>
        <FormLabel>Notes</FormLabel>
        <InputGroup>
          <Textarea
            placeholder="Some notes about this distribution..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => setFormData({ ...formData, notes })}
          />
        </InputGroup>
      </FormControl>

      <Flex mt="8" justifyContent="center" alignItems="center">
        <Button
          colorScheme="blue"
          width={200}
          onClick={() => {
            /* handle save logic here */
            handleSaveAllocation()
          }}
        >
          Save
        </Button>
      </Flex>

      <Modal isOpen={isSaving} closeOnOverlayClick={false} closeOnEsc={false}>
        <ModalOverlay />
        <ModalContent
          background="transparent"
          boxShadow="none"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" thickness="4px" color="blue.500" />
        </ModalContent>
      </Modal>
    </>
  )
}
