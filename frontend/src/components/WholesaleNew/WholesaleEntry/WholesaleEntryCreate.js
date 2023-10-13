import {
  Button,
  Select,
  Text,
  Input,
  Flex,
  Heading,
  Box,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import { Autocomplete } from 'components/Autocomplete/Autocomplete'
import {
  EMPTY_CATEGORIZED_WEIGHT,
  formatTimestamp,
  SE_API,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import { useApi, useAuth } from 'hooks'
import moment from 'moment'
import { useState, useMemo, useEffect } from 'react'

import { WholesaleBeforeSorting } from './WholesaleBeforeSorting'
import { WholesaleAfterSorting } from './WholesaleAfterSorting'

export function WholesaleEntryCreate({ defaultDate }) {
  const params = new URLSearchParams(window.location.search)
  const rescue_id = params.get('edit')

  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: formatTimestamp(new Date(), 'YYYY-MM-DDTHH:mm'),
    organization: null,
    location: null,
    weight: '',
    food_category: null,
    notes: '',
    pallet: null,
    totalCaseCount: '',
    averageCaseWeight: '',
  })

  const [summary, setSummary] = useState({
    totalCaseCount: 0,
    averageCaseWeight: 0,
    totalWeight: 0,
    palletCount: 0,
    sorted: false,
  })

  const [isLoading, setIsLoading] = useState()

  const toast = useToast()
  const [triggerWholesaleReset, setTriggerWholesaleReset] = useState(false)

  const { data: rescue } = useApi(
    rescue_id ? `/rescues/get/${rescue_id}` : null
  )

  const [activeTab, setActiveTab] = useState('before-sorting')
  const [isSorted, setIsSorted] = useState(false)

  useEffect(() => {
    if (rescue) {
      if (rescue.transfers[0].sorted) {
        setActiveTab('after-sorting')
        setIsSorted(true)
      }
    }
  }, [rescue])

  useEffect(() => {
    if (rescue) {
      setFormData({
        date: formatTimestamp(rescue.timestamp_scheduled, 'YYYY-MM-DDTHH:mm'),
        organization: rescue.transfers[0].organization,
        location: rescue.transfers[0].location,
        weight: rescue.transfers[0].total_weight,
        food_category:
          rescue.transfers[0].food_category === undefined || null || ''
            ? Object.keys(rescue.transfers[0].categorized_weight).filter(
                key => rescue.transfers[0].categorized_weight[key] > 0
              )[0]
            : rescue.transfers[0].food_category,
        product_type: rescue.transfers[0].product_type,
        notes: rescue.notes,
        pallet: rescue.transfers[0].pallet,
        totalCaseCount: rescue.transfers[0].total_case_count || '',
        averageCaseWeight: rescue.transfers[0].average_case_weight || '',
        vegetables: rescue.transfers[0].vegetables || false,
        fruits: rescue.transfers[0].fruits || false,
        sorted: rescue.transfers[0].sorted || false,
      })

      setSummary({
        totalCaseCount: rescue.transfers[0].total_case_count || 0,
        averageCaseWeight: rescue.transfers[0].average_case_weight || 0,
        totalWeight: rescue.transfers[0].total_weight || 0,
        palletCount: rescue.transfers[0].pallet || 0,
        sorted: rescue.transfers[0].sorted || false,
      })
    }
  }, [rescue, activeTab])

  const { data: donors } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'donor' }), [])
  )

  const totalWeight = formData.weight - palletWeight(formData.pallet)

  function validateForm() {
    if (!formData.organization) {
      toast({
        title: 'Error!',
        description: `Please select a donor.`,
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    if (!formData.location) {
      toast({
        title: 'Error!',
        description: `Please select a location.`,
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    if (!formData.totalWeight < 0) {
      toast({
        title: 'Error!',
        description: `Please enter a valid weight.`,
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
      return
    }
  }

  // create wholesale rescue
  async function handleCreateRescue() {
    await validateForm()

    const payload = {
      type: 'wholesale',
      status: STATUSES.ACTIVE,
      handler_id: user.id,
      sorted: summary.sorted || false,
      notes: formData.notes || '',
      timestamp_scheduled: moment(formData.date).toISOString(),
      timestamp_completed: null,
      transfers: [
        {
          type: TRANSFER_TYPES.COLLECTION,
          status: STATUSES.COMPLETED,
          handler_id: user.id,
          organization_id: formData.organization.id,
          location_id: formData.location.id,
          notes: formData.notes || '',
          timestamp_completed: moment(formData.date).toISOString(),
          total_case_count: summary.totalCaseCount || 0,
          average_case_weight: summary.averageCaseWeight || 0,
          total_weight: summary.totalWeight || 0,
          categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
          product_type: formData.product_type || '',
          food_category: formData.food_category || '',
          vegetables: formData.vegetables || false,
          fruits: formData.fruits || false,
          pallet: formData.pallet || 0,
          sorted: summary.sorted || false,
        },
      ],
    }

    payload.transfers[0].categorized_weight[formData.food_category] =
      payload.transfers[0].total_weight

    setIsLoading(true)

    await SE_API.post('/rescues/create', payload, user.accessToken)

    setIsLoading(false)

    await toast({
      title: 'All set!',
      description: `Entry successfull!`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })

    setTriggerWholesaleReset(!triggerWholesaleReset)
    resetFormData()
  }

  function resetFormData() {
    setFormData({
      date: formatTimestamp(defaultDate || new Date(), 'YYYY-MM-DDTHH:mm'),
      organization: null,
      location: null,
      weight: '',
      food_category: 'produce',
      notes: '',
      pallet: null,
      totalCaseCount: '',
      averageCaseWeight: '',
    })

    setSummary({
      totalCaseCount: 0,
      averageCaseWeight: 0,
      totalWeight: 0,
      palletCount: 0,
    })
  }

  async function handleUpdateRescue() {
    setIsLoading(true)

    const transfer = rescue.transfers[0]

    const transfer_payload = {
      id: transfer.id,
      type: transfer.type,
      status: transfer.status,
      rescue_id: transfer.rescue_id,
      handler_id: transfer.handler_id,
      organization_id: transfer.organization_id,
      location_id: transfer.location_id,
      notes: formData.notes,
      timestamp_completed: moment(formData.date).toISOString(),
      total_weight: summary.totalWeight || 0,
      categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
      product_type: formData.product_type || '',
      food_category: formData.food_category || '',
      vegetables: formData.vegetables || false,
      fruits: formData.fruits || false,
      pallet: formData.pallet || 0,
      sorted: summary.sorted || false,
      total_case_count: summary.totalCaseCount || 0,
      average_case_weight: summary.averageCaseWeight || 0,
    }

    transfer_payload.categorized_weight[formData.food_category] =
      formData.weight

    console.log('Update payload', transfer_payload)

    await SE_API.post(
      `/transfers/update/${transfer.id}`,
      transfer_payload,
      user.accessToken
    )

    const payload = {
      id: rescue.id,
      type: rescue.type,
      status: rescue.status,
      handler_id: rescue.handler_id,
      notes: formData.notes || '',
      weight: formData.weight,
      timestamp_scheduled: moment(formData.date).toISOString(),
      timestamp_completed: rescue.timestamp_completed,
      transfer_ids: rescue.transfer_ids,
    }

    await SE_API.post(`/rescues/update/${rescue_id}`, payload, user.accessToken)

    setIsLoading(false)

    toast({
      title: 'All set!',
      description: `Update successfull!`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })
  }

  function SummarySection() {
    return (
      <Box mb={4}>
        <Heading as="h3" size="md" color="brand.500" mb={4}>
          Summary
        </Heading>

        <Flex justifyContent="space-between">
          <Box mr={4}>
            <Text mb={2}>Total case count</Text>
            {summary.totalCaseCount ? (
              <Text fontWeight="bold">{summary.totalCaseCount}</Text>
            ) : (
              <Text>0</Text>
            )}
          </Box>

          <Box mr={4}>
            <Text mb={2}>Average case weight (lbs)</Text>
            {summary.averageCaseWeight ? (
              <Text fontWeight="bold">{summary.averageCaseWeight}</Text>
            ) : (
              <Text>0 lbs.</Text>
            )}
          </Box>

          <Box>
            <Text mb={2}>Total weight (lbs)</Text>
            {summary.totalWeight ? (
              <Text fontWeight="bold">{summary.totalWeight}</Text>
            ) : (
              <Text>0 lbs.</Text>
            )}
          </Box>
        </Flex>
      </Box>
    )
  }

  return (
    <>
      <Box mb={10}>
        <AddDonationHeader />
        <AddEntryHeader
          formData={formData}
          setFormData={setFormData}
          donors={donors}
          rescue={rescue}
        />
      </Box>
      <SummarySection formData={formData} />

      <Flex align="center">
        <Button
          onClick={() => setActiveTab('before-sorting')}
          variant={activeTab === 'before-sorting' ? '' : '#c9e8bc'}
          backgroundColor={
            activeTab === 'before-sorting' ? '#4ea528' : '#c9e8bc'
          }
          borderRadius={0}
          textColor={activeTab === 'before-sorting' ? 'white' : '#4ea528'}
          borderTopLeftRadius={10}
        >
          Before Sorting
        </Button>
        <Button
          onClick={() => setActiveTab('after-sorting')}
          variant={activeTab === 'after-sorting' ? '' : '#c9e8bc'}
          backgroundColor={
            activeTab === 'after-sorting' ? '#4ea528' : '#c9e8bc'
          }
          borderRadius={0}
          textColor={activeTab === 'after-sorting' ? 'white' : '#4ea528'}
          borderTopRightRadius={10}
        >
          After Sorting
        </Button>
      </Flex>
      <Flex
        border="1px solid #7e7d7d"
        p="4"
        direction="column"
        boxShadow="sm"
        mb={10}
        mt={0}
        borderRadius={10}
        borderTopLeftRadius={0}
      >
        {activeTab === 'before-sorting' ? (
          <WholesaleBeforeSorting
            formData={formData ? formData : null}
            setFormData={setFormData}
            setSummary={setSummary}
            triggerReset={triggerWholesaleReset}
          />
        ) : (
          <WholesaleAfterSorting
            formData={formData}
            summary={summary}
            setSummary={setSummary}
            isSorted={isSorted}
          />
        )}
      </Flex>

      <AddDonationFooter
        formData={formData}
        totalWeight={totalWeight}
        handleCreateRescue={handleCreateRescue}
        handleUpdateRescue={handleUpdateRescue}
        isLoading={isLoading}
        setFormData={setFormData}
        rescue={rescue}
      />
    </>
  )
}

function AddDonationHeader() {
  return <Heading>Entry Details</Heading>
}

function AddEntryHeader({ formData, setFormData, donors, rescue }) {
  const [productType] = useState(formData.product_type)
  const [date, setDate] = useState(formData.date)

  function handleDonorSearch(value) {
    return donors
      ? donors
          .filter(i => i.locations?.length)
          .filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
      : []
  }

  function updateParentProductType(e) {
    setFormData({ ...formData, product_type: e.target.value })
  }

  function updateParentDate() {
    setFormData({ ...formData, date })
  }

  function handleSelectDonor(value) {
    const location = value?.locations?.length === 1 ? value.locations[0] : null
    setFormData({ ...formData, organization: value, location })
  }

  console.log('formData', formData)

  return (
    <>
      <Flex direction="row" wrap={true} justifyContent="space-between">
        <Flex direction="column" flexGrow="1" p={1}>
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
            value={formData.date}
            onChange={e => setDate(e.target.value)}
            onBlur={updateParentDate}
            mb="6"
          />
          <Autocomplete
            label="Donor"
            placeholder="Name..."
            value={formData.organization}
            setValue={handleSelectDonor}
            displayField="name"
            handleChange={handleDonorSearch}
            listBackground="surface.background"
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
              {rescue ? (
                <option
                  value={rescue.transfers[0].location.id}
                  key={rescue.transfers[0].location.key}
                >
                  {rescue.transfers[0].location.nickname} (
                  {rescue.transfers[0].location.address1})
                </option>
              ) : (
                formData.organization.locations.map(i => (
                  <option value={i.id} key={i.id}>
                    {i.nickname ? `${i.nickname} (${i.address1})` : i.address1}
                  </option>
                ))
              )}
            </Select>
          )}
        </Flex>

        <Flex direction="column" flexGrow="1" p={1}>
          <Text
            color="element.tertiary"
            fontSize="xs"
            fontWeight="700"
            mt="6"
            textTransform="uppercase"
          >
            Product Type
          </Text>
          <Input
            min="0"
            fontSize="sm"
            value={productType ? productType : formData.product_type}
            onChange={updateParentProductType}
            placeholder="Name"
          />

          <Text
            color="element.tertiary"
            fontSize="xs"
            fontWeight="700"
            mt="6"
            textTransform="uppercase"
          >
            Food Category
          </Text>
          <Select
            value={formData.food_category}
            onChange={e =>
              setFormData({ ...formData, food_category: e.target.value })
            }
          >
            <option value="produce">Produce</option>
            <option value="dairy">Dairy</option>
            <option value="bakery">Bakery</option>
            <option value="meat_fish">Meat/Fish</option>
            <option value="non_perishable">Non-perishable</option>
            <option value="prepared_frozen">Prepared/Frozen</option>
            <option value="mixed">Mixed</option>
            <option value="other">Other</option>
          </Select>

          <Flex direction="row" mt="4">
            <Checkbox
              value={formData.vegetables}
              onChange={e =>
                setFormData({ ...formData, vegetables: e.target.checked })
              }
              isChecked={formData.vegetables}
            >
              Vegetables
            </Checkbox>

            <Checkbox
              value={formData.fruits}
              onChange={e =>
                setFormData({ ...formData, fruits: e.target.checked })
              }
              ml="4"
              isChecked={formData.fruits}
            >
              Fruits
            </Checkbox>
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="row" wrap={true} justifyContent="space-between"></Flex>
    </>
  )
}

function AddDonationFooter({
  formData,
  totalWeight,
  handleCreateRescue,
  handleUpdateRescue,
  isLoading,
  setFormData,
  rescue,
}) {
  return (
    <>
      <Flex direction="column" mb="4">
        <Text
          color="element.tertiary"
          fontSize="xs"
          fontWeight="700"
          mt="6"
          textTransform="uppercase"
        >
          Description
        </Text>
        <Input
          type="text"
          fontSize="sm"
          value={formData.notes}
          onChange={e =>
            setFormData({
              notes: e.target.value,
              organization: formData.organization,
              location: formData.location,
              weight: formData.weight,
              food_category: formData.food_category,
              product_type: formData.product_type,
              pallet: formData.pallet,
              vegetables: formData.vegetables,
              fruits: formData.fruits,
              sorted: formData.sorted,
            })
          }
          placeholder="Enter description"
        />
      </Flex>
      <Flex justifyContent={'space-between'}>
        <Button
          size="lg"
          w="100%"
          disabled={!formData.organization || totalWeight < 0}
          onClick={rescue ? handleUpdateRescue : handleCreateRescue}
          isLoading={isLoading}
          loadingText={'Submitting Rescue...'}
          mr={6}
        >
          {rescue ? 'Update Rescue' : 'Save Rescue'}{' '}
          {formData.weight ? `(${totalWeight} lbs.)` : ''}
        </Button>
      </Flex>
      <Modal isOpen={isLoading} closeOnOverlayClick={false} closeOnEsc={false}>
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

function palletWeight(type) {
  if (!type) return 0
  switch (type) {
    case 'wood':
      return 345
    case 'black':
      return 350
    case 'blue':
      return 373
    case 'other':
      return 0
    default:
      return 0
  }
}
