import { ArrowRightIcon, EditIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { PageTitle, FooterButton } from 'components'
import { formatLargeNumber, SE_API, STATUSES } from 'helpers'
import { useApi, useAuth } from 'hooks'
import moment from 'moment'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EditDonation } from './Wholesale.EditDonation'
import { AddRecipient } from './WholesaleRescue.AddRecipient'
import { EditRecipient } from './WholesaleRescue.EditRecipient'
import { Recipient } from './WholesaleRescue.Recipient'

const WholesaleRescueContext = createContext({})
WholesaleRescueContext.displayName = 'WholesaleRescueContext'
export const useWholesaleRescueContext = () =>
  useContext(WholesaleRescueContext)

export function WholesaleRescue({ setBreadcrumbs, setTitle }) {
  const { id } = useParams()
  const { data: rescue, refresh } = useApi(`/rescues/get/${id}`)
  const { hasAdminPermission } = useAuth()
  const [editDonation, setEditDonation] = useState(false)
  const [addRecipient, setAddRecipient] = useState(false)
  const [editRecipient, setEditRecipient] = useState()
  const [isLoading, setIsLoading] = useState()
  const { user } = useAuth()
  const navigate = useNavigate()

  const donation = useMemo(() => rescue?.transfers[0], [rescue])
  const recipients = useMemo(() => rescue?.transfers.slice(1), [rescue])
  const remainingWeight = useMemo(
    () =>
      donation && recipients
        ? donation.total_weight -
          recipients.reduce((total, curr) => total + curr.total_weight, 0)
        : null,
    [recipients, donation]
  )

  useEffect(() => {
    setTitle('Wholesale Rescue')
    setBreadcrumbs([
      { label: 'Wholesale', link: '/wholesale' },
      { label: 'Donation', link: `/wholesale/${id}` },
    ])
  }, [id])

  // useEffect(() => {
  // if (
  //   remainingWeight < rescue?.transfers.length &&
  //   rescue?.status === STATUSES.ACTIVE
  // ) {
  //   // complete rescue
  //   SE_API.post(
  //     `/rescues/update/${rescue.id}`,
  //     {
  //       id: rescue.id,
  //       type: rescue.type,
  //       status: STATUSES.COMPLETED,
  //       handler_id: rescue.handler_id,
  //       notes: rescue.notes,
  //       timestamp_scheduled: moment(rescue.timestamp_scheduled).toISOString(),
  //       timestamp_completed: moment().toISOString(),
  //       transfer_ids: rescue.transfer_ids,
  //     },
  //     user.accessToken
  //   ).then(refresh)
  //   }
  // }, [remainingWeight, rescue])

  // [todo] - Remove this and revert to auto complete
  async function handleCompleteRescue() {
    setIsLoading(true)

    if (
      remainingWeight < rescue?.transfers.length &&
      rescue?.status === STATUSES.ACTIVE
    ) {
      // complete rescue
      await SE_API.post(
        `/rescues/update/${rescue.id}`,
        {
          id: rescue.id,
          type: rescue.type,
          status: STATUSES.COMPLETED,
          handler_id: rescue.handler_id,
          notes: rescue.notes,
          timestamp_scheduled: moment(rescue.timestamp_scheduled).toISOString(),
          timestamp_completed: rescue.timestamp_completed
            ? moment(rescue.timestamp_completed).toISOString()
            : moment(rescue.timestamp_scheduled).toISOString(),
          transfer_ids: rescue.transfer_ids,
        },
        user.accessToken
      ).then(refresh)
    }

    setIsLoading(false)
  }

  // [todo] - Remove this and revert to auto complete
  async function makeRescueActive() {
    setIsLoading(true)

    await SE_API.post(
      `/rescues/update/${rescue.id}`,
      {
        id: rescue.id,
        type: rescue.type,
        status: STATUSES.ACTIVE,
        handler_id: rescue.handler_id,
        notes: rescue.notes,
        timestamp_scheduled: moment(rescue.timestamp_scheduled).toISOString(),
        timestamp_completed:
          moment(rescue.timestamp_completed).toISOString() || null,
        transfer_ids: rescue.transfer_ids,
      },
      user.accessToken
    ).then(refresh)

    setIsLoading(false)
  }

  async function cancelDonation() {
    const notes = window.prompt('Why are you cancelling this donation?')
    if (notes) {
      await SE_API.post(`/rescues/cancel/${id}`, { notes }, user.accessToken)
      navigate('/wholesale')
    } else window.alert('This donation was not cancelled.')
  }

  if (!rescue) return <LoadingDonation />

  return (
    <WholesaleRescueContext.Provider
      value={{
        rescue,
        donation: rescue.transfers[0],
        refresh,
        editRecipient,
        cancelDonation,
      }}
    >
      <PageTitle>{rescue.status} Rescue</PageTitle>
      <Box pb="16">
        <Flex my="8" justify="space-between">
          <Box>
            <Heading
              as="h2"
              size="md"
              fontWeight="600"
              color="element.primary"
              mb="1"
            >
              {donation.organization.name}
            </Heading>
            <Text fontSize="sm" fontWeight="300" color="element.secondary">
              <Text as="span" color="se.brand.primary" fontWeight={700}>
                {' '}
                {formatLargeNumber(donation.total_weight)} lbs.
              </Text>
              &nbsp;&nbsp;
              {moment(donation.timestamp_completed).format(
                'dddd M/DD/YY - hh:mma'
              )}
            </Text>
            <Text fontSize="sm" fontWeight="300" color="element.secondary">
              <Text as="span" fontWeight={700}>
                Notes:{' '}
              </Text>
              "{donation.notes}"
            </Text>
          </Box>
          {hasAdminPermission && (
            <IconButton
              variant="ghosted"
              color="se.brand.primary"
              icon={<EditIcon h="6" w="6" />}
              onClick={() => setEditDonation(true)}
            />
          )}
        </Flex>
        {recipients.length ? (
          recipients.map(i => (
            <Recipient
              key={i.id}
              recipient={i}
              setEditRecipient={setEditRecipient}
            />
          ))
        ) : (
          <Flex direction="column" my="12" justify="center" align="center">
            <ArrowRightIcon w="16" h="16" mb="8" color="se.brand.primary" />
            <Heading as="h4" align="center" mb="2">
              Let's distribute food!
            </Heading>
            <Text color="element.secondary" align="center">
              Add a distribution below to log where this food is going.
            </Text>
          </Flex>
        )}

        <EditDonation
          isOpen={editDonation}
          handleClose={() => setEditDonation(false)}
        />

        <EditRecipient
          isOpen={!!editRecipient}
          handleClose={() => setEditRecipient(null)}
        />

        <AddRecipient
          isOpen={addRecipient}
          handleClose={() => setAddRecipient(false)}
        />

        {hasAdminPermission && (
          <Flex justify="center" w="100%">
            {remainingWeight < rescue?.transfers.length &&
            rescue?.status === STATUSES.ACTIVE ? (
              <FooterButton
                isLoading={isLoading}
                loadingText="Completing rescue..."
                onClick={handleCompleteRescue}
                disabled={rescue.status === STATUSES.COMPLETED}
              >
                Complete Rescue
              </FooterButton>
            ) : (
              <FooterButton
                onClick={() => setAddRecipient(true)}
                disabled={rescue.status === STATUSES.COMPLETED}
              >
                New Distribution {formatLargeNumber(remainingWeight)} lbs. left
              </FooterButton>
            )}
          </Flex>
        )}

        {rescue.status === STATUSES.COMPLETED && (
          <Flex justify="center" w="100%">
            <FooterButton
              isLoading={isLoading}
              loadingText="Please wait..."
              onClick={makeRescueActive}
            >
              Edit Rescue
            </FooterButton>
          </Flex>
        )}
      </Box>
    </WholesaleRescueContext.Provider>
  )
}

function LoadingDonation() {
  return (
    <>
      <PageTitle>Loading Donation...</PageTitle>
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
      <Skeleton w="100%" h="32" my="4" />
    </>
  )
}
