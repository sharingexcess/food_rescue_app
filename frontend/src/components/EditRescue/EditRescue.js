import { Box, Button, Flex, Skeleton } from '@chakra-ui/react'
import { PageTitle } from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { memo, useEffect, useMemo, useState } from 'react'
import {
  EMPTY_CATEGORIZED_WEIGHT,
  formatTimestamp,
  SE_API,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import moment from 'moment'
import { useNavigate, useParams } from 'react-router-dom'
import { InfoForm } from './EditRescue.InfoForm'
import { AddTransfer } from './EditRescue.AddTransfer'
import { Transfers } from './EditRescue.Transfers'

export function EditRescue({ setBreadcrumbs, setTitle }) {
  const { user } = useAuth()
  const { rescue_id } = useParams()
  const { data: rescue } = useApi(`/rescues/get/${rescue_id}`)
  const { data: handlers } = useApi('/public_profiles/list')
  const { data: donors } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'donor' }), [])
  )
  const { data: recipients } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'recipient' }), [])
  )
  const [formData, setFormData] = useState({
    timestamp_scheduled: '',
    handler: null,
  })
  const [view, setView] = useState(null)
  const [working, setWorking] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const [transfers, setTransfers] = useState()
  const [transfersToCancel, setTransfersToCancel] = useState([])

  useEffect(() => {
    setTitle('Edit Rescue')
    setBreadcrumbs([
      { label: 'Rescues', link: '/rescues' },
      {
        label: 'Rescue',
        link: `/rescues/${rescue_id}`,
      },
      { label: 'Edit', link: `/rescues/${rescue_id}/edit` },
    ])
  }, [rescue_id])

  useEffect(() => {
    if (rescue && !transfers) {
      setFormData({
        timestamp_scheduled: formatTimestamp(
          rescue.timestamp_scheduled,
          'YYYY-MM-DDTHH:mm'
        ),
        handler: rescue.handler,
      })
      setTransfers(rescue.transfers)
    }
  }, [rescue])

  async function handleAddTransfer(transfer) {
    setTransfers(currentTransfers => [
      ...currentTransfers,
      {
        ...transfer,
        organization_id: transfer.organization.id,
        location_id: transfer.location.id,
        status: STATUSES.SCHEDULED,
      },
    ])
    setView(null)
  }

  function removeTransfer(transfer) {
    if (
      window.confirm(
        'Are you sure you want to delete this transfer? This cannot be undone.'
      )
    ) {
      setTransfers(
        transfers.filter(i => JSON.stringify(i) !== JSON.stringify(transfer))
      )
      if (transfer.id) {
        // we only need to track transfers that are already in the DB (those that have an id)
        // those without an id only exist locally (they were just created), so we can just
        // simply ignore them
        setTransfersToCancel(transfers => [...transfers, transfer])
      }
    }
  }

  async function handleCancelTransfer(transfer) {
    await SE_API.post(
      `/transfers/cancel/${transfer.id}`,
      { notes: `Cancelled by ${user.name} from Edit Rescue screen.` },
      user.accessToken
    )
  }

  async function handleUpdateRescue() {
    setWorking(true)

    if (transfersToCancel.length) {
      for (const transfer of transfersToCancel) {
        await handleCancelTransfer(transfer)
      }
    }

    // iterate through transfers list to create db objects for any new transfers
    // then replace the temp transfers with the fully created records
    let index = 0
    for (const transfer of transfers) {
      // if the transfer has no id, it needs to be created by the server
      if (!transfer.id) {
        const new_transfer_payload = {
          type: transfer.type,
          status: STATUSES.SCHEDULED,
          rescue_id: rescue.id,
          rescue_scheduled_time: rescue.timestamp_scheduled || null,
          handler_id: formData.handler?.id || null,
          organization_id: transfer.organization.id,
          location_id: transfer.location.id,
          notes: '',
          timestamp_completed: null,
          total_weight: 0,
          categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
        }

        if (transfer.type === TRANSFER_TYPES.DISTRIBUTION) {
          new_transfer_payload.percent_of_total_dropped = 100
        }

        // create the new transfer, which will return a new id
        const new_transfer = await SE_API.post(
          `/transfers/create`,
          new_transfer_payload,
          user.accessToken
        )

        // replace the original with the complete transfer
        transfers[index] = new_transfer
      } else if (transfer.handler_id !== formData.handler?.id) {
        // if the transfer is not new, but the handler_id has changed,
        // update it with the latest handler_id

        const update_transfer_payload = {
          id: transfer.id,
          timestamp_scheduled: moment(
            formData.timestamp_scheduled
          ).toISOString(),
          handler_id: formData.handler?.id || null,
          type: transfer.type,
          status: transfer.status,
          rescue_id: rescue.id,
          rescue_scheduled_time: rescue.timestamp_scheduled,
          organization_id: transfer.organization.id,
          location_id: transfer.location.id,
          notes: transfer.notes,
          timestamp_completed: transfer.timestamp_completed,
          total_weight: transfer.total_weight,
          categorized_weight: transfer.categorized_weight,
        }

        if (transfer.type === TRANSFER_TYPES.DISTRIBUTION) {
          update_transfer_payload.percent_of_total_dropped =
            transfer.percent_of_total_dropped
        }

        const existing_transfer = await SE_API.post(
          `/transfers/update/${transfer.id}`,
          update_transfer_payload,
          user.accessToken
        )

        // replace the original with the updated transfer
        transfers[index] = existing_transfer
      }
      index++
    }

    // make the rescue update call last, after all transfers are updated
    // this is to ensure that the final recalculation happens
    // without risking race conditions
    const rescue_payload = {
      id: rescue_id,
      type: rescue.type,
      status: rescue.status,
      notes: rescue.notes,
      timestamp_completed: rescue.timestamp_completed,
      timestamp_scheduled: moment(formData.timestamp_scheduled).toISOString(),
      handler_id: formData.handler?.id || null,
      transfer_ids: transfers.map(i => i.id),
    }

    await SE_API.post(
      `/rescues/update/${rescue_id}`,
      rescue_payload,
      user.accessToken
    )
    navigate(`/rescues/${rescue_id}`)
  }

  // should be for remaining transfers only for active routes
  // keep the same for inactive routes
  // for scheduled routes, don't have cancel transfers (don't show canceled transfers for scheduled routes)
  // be able to remove (not mark as cancelled) transfers with an x in top right when editing rescue (for scheduled rescues that have not been started) (FOR ALL RESCUES)
  const isValidRescue =
    formData.timestamp_scheduled &&
    transfers.length >= 2 &&
    transfers.filter(s => s.status !== STATUSES.CANCELLED && !s.is_deleted)[0]
      ?.type == TRANSFER_TYPES.COLLECTION &&
    transfers[transfers.length - 1].type === TRANSFER_TYPES.DISTRIBUTION

  if (!rescue) return <LoadingEditRescue />

  return (
    <>
      <PageTitle>Edit Rescue</PageTitle>
      <InfoForm
        formData={formData}
        setFormData={setFormData}
        handlers={handlers}
      />
      <Transfers
        transfers={transfers}
        setTransfers={setTransfers}
        removeTransfer={removeTransfer}
      />
      {view ? (
        <AddTransfer
          type={view}
          handleAddTransfer={handleAddTransfer}
          handleCancel={() => setView(null)}
          organizations={
            view === TRANSFER_TYPES.COLLECTION
              ? donors
              : view === TRANSFER_TYPES.DISTRIBUTION
              ? recipients
              : null
          }
        />
      ) : (
        <Flex w="100%" gap="4" mt="8" mb="4" justify="center" wrap="wrap">
          <Button
            variant="secondary"
            onClick={() => setView(TRANSFER_TYPES.COLLECTION)}
            flexGrow={isMobile ? '1' : '0'}
            background="blue.secondary"
            color="blue.primary"
            isLoading={!donors}
          >
            {transfers?.length === 0 ? 'Add Transfers' : 'Add Collection'}
          </Button>
          {transfers?.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setView(TRANSFER_TYPES.DISTRIBUTION)}
              flexGrow={isMobile ? '1' : '0'}
              isLoading={!recipients}
            >
              Add Distribution
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleUpdateRescue}
            flexGrow="1"
            flexBasis={isMobile ? '100%' : null}
            isLoading={working}
            disabled={!isValidRescue}
            loadingText="Updating Rescue..."
          >
            Update Rescue
          </Button>
        </Flex>
      )}
    </>
  )
}

const LoadingEditRescue = memo(function LoadingEditRescue() {
  return (
    <>
      <PageTitle>Loading Rescue...</PageTitle>
      <Skeleton h="16" my="6" />
      <Skeleton h="16" my="6" />
      <Skeleton h="16" my="6" />
      <Box h="8" />
      <Skeleton h="32" my="4" />
      <Skeleton h="32" my="4" />
      <Skeleton h="32" my="4" />
      <Skeleton h="32" my="4" />
      <Skeleton h="32" my="4" />
    </>
  )
})
