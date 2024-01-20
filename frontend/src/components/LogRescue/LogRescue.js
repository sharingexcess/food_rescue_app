import { Button, Flex } from '@chakra-ui/react'
import { PageTitle, Collection, Distribution } from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import {
  calculateCurrentLoad,
  EMPTY_CATEGORIZED_WEIGHT,
  SE_API,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { AddTransfer } from './LogRescue.AddTransfer'
import { Transfers } from 'components/LogRescue/LogRescue.Transfers'
import { InfoForm } from './LogRescue.InfoForm'

export function LogRescue() {
  const { user } = useAuth()
  const { data: handlers } = useApi('/public_profiles/list')
  const { data: donors } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'donor' }), [])
  )
  const { data: recipients } = useApi(
    '/organizations/list',
    useMemo(() => ({ type: 'recipient' }), [])
  )

  const form_data_cache = sessionStorage.getItem(
    'se_log_rescue_form_data_cache'
  )
  const [formData, setFormData] = useState(
    form_data_cache
      ? JSON.parse(form_data_cache)
      : {
          type: 'retail',
          timestamp_scheduled: '',
          timestamp_completed: '',
          handler: null,
          notes: '',
        }
  )
  const [view, setView] = useState(null)
  const [working, setWorking] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const transfers_cache = sessionStorage.getItem(
    'se_log_rescue_transfers_cache'
  )
  const [transfers, setTransfers] = useState(
    transfers_cache ? JSON.parse(transfers_cache) : []
  )

  const [activeTransfer, setActiveTransfer] = useState()

  useEffect(() => {
    sessionStorage.setItem(
      'se_log_rescue_form_data_cache',
      JSON.stringify(formData)
    )
  }, [formData])

  useEffect(() => {
    transfers?.length
      ? sessionStorage.setItem(
          'se_log_rescue_transfers_cache',
          JSON.stringify(transfers)
        )
      : sessionStorage.removeItem('se_log_rescue_transfers_cache')
  }, [transfers])

  async function handleAddTransfer(transfer) {
    setTransfers(currentTransfers => [
      ...currentTransfers,
      {
        type: transfer.type,
        status: STATUSES.SCHEDULED,
        organization_id: transfer.organization.id,
        location_id: transfer.location.id,
        // include full organization and location objects
        // to enable rendering out full transfer cards
        organization: transfer.organization,
        location: transfer.location,
        notes: transfer.notes,
        total_weight: 0,
        categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
      },
    ])
    setView(null)
  }

  function removeTransfer(index) {
    if (window.confirm('Are you sure you want to remove this transfer?')) {
      setTransfers([
        ...transfers.slice(0, index),
        ...transfers.slice(index + 1),
      ])
    }
  }

  async function handleLogRescue() {
    setWorking(true)
    sessionStorage.removeItem('se_log_rescue_transfers_cache')
    sessionStorage.removeItem('se_log_rescue_form_data_cache')

    const rescue = await SE_API.post(
      `/rescues/create`,
      {
        type: formData.type,
        status: STATUSES.COMPLETED,
        handler_id: formData.handler.id,
        notes: formData.notes,
        timestamp_scheduled: moment(formData.timestamp_scheduled).toISOString(),
        timestamp_completed: moment(formData.timestamp_completed).toISOString(),
        transfers: transfers.map(transfer => ({
          ...transfer,
          handler_id: formData.handler.id,
          timestamp_completed: moment(
            formData.timestamp_completed
          ).toISOString(),
          rescue_scheduled_time: moment(
            formData.timestamp_scheduled
          ).toISOString(),
        })),
      },
      user.accessToken
    )
    navigate(`/rescues/${rescue.id}`)
  }

  function handleUpdateCollection(collection) {
    // we receive the full updated collection as an arg, but need to
    // insert it back into the transfers array.
    // that's tough because our transfers don't have an id yet.
    // however, the fact that we were editing this transfer means that
    // it's current version is still saved as activeTransfer.
    // so we'll look for the item in the array that matches activeTransfer,
    // and replace that one.
    const transfer_index = transfers.findIndex(
      i => JSON.stringify(i) === JSON.stringify(activeTransfer)
    )
    const updatedTransfers = [...transfers]
    // merge the previous active transfer and the new collection
    // so that we keep the full organization and location objects
    // from activeTransfer
    updatedTransfers[transfer_index] = { ...activeTransfer, ...collection }

    setTransfers(updatedTransfers)
    setActiveTransfer(null)
  }

  function handleUpdateDistribution(distribution) {
    // we receive the full updated distribution as an arg, but need to
    // insert it back into the transfers array.
    // that's tough because our transfers don't have an id yet.
    // however, the fact that we were editing this transfer means that
    // it's current version is still saved as activeTransfer.
    // so we'll look for the item in the array that matches activeTransfer,
    // and replace that one.
    console.log(distribution)
    const transfer_index = transfers.findIndex(
      i => JSON.stringify(i) === JSON.stringify(activeTransfer)
    )
    const updatedTransfers = [...transfers]
    // merge the previous active transfer and the new collection
    // so that we keep the full organization and location objects
    // from activeTransfer
    updatedTransfers[transfer_index] = { ...activeTransfer, ...distribution }

    setTransfers(updatedTransfers)
    setActiveTransfer(null)
  }

  console.log()
  const isValidRescue =
    formData.handler &&
    formData.timestamp_scheduled &&
    formData.timestamp_completed &&
    formData.timestamp_scheduled < formData.timestamp_completed &&
    transfers.length >= 2 &&
    transfers[0].type == TRANSFER_TYPES.COLLECTION &&
    transfers[transfers.length - 1].type === TRANSFER_TYPES.DISTRIBUTION &&
    transfers[transfers.length - 1].percent_of_total_dropped === 100 && // confirm that all remaining weight is handled in final distribution
    transfers.reduce(
      (total, curr) => total && curr.status === STATUSES.COMPLETED
    ) && // ensure all transfers are completed
    calculateCurrentLoad({ transfers }) <= transfers.length // allow margin of error of 1 lb. per stop (worst case rounding error)

  return (
    <>
      <PageTitle>Log Rescue</PageTitle>
      <InfoForm
        formData={formData}
        setFormData={setFormData}
        handlers={handlers}
      />
      <Transfers
        transfers={transfers}
        setTransfers={setTransfers}
        removeTransfer={removeTransfer}
        setActiveTransfer={setActiveTransfer}
      />
      {activeTransfer?.type === TRANSFER_TYPES.COLLECTION ? (
        <Collection
          collection={activeTransfer}
          handleSubmitOverride={handleUpdateCollection}
          handleCloseCollectionOverride={() => setActiveTransfer(null)}
          logRescueType={formData.type ? formData.type : null}
        />
      ) : activeTransfer?.type === TRANSFER_TYPES.DISTRIBUTION ? (
        <Distribution
          distribution={activeTransfer}
          rescueOverride={{ transfers }}
          handleCloseDistributionOverride={() => setActiveTransfer(null)}
          handleSubmitOverride={handleUpdateDistribution}
          logRescueType={formData.type ? formData.type : null}
        />
      ) : null}
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
            {transfers.length === 0 ? 'Add Transfers' : 'Add Collection'}
          </Button>
          {transfers.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setView(TRANSFER_TYPES.DISTRIBUTION)}
              flexGrow={isMobile ? '1' : '0'}
              isLoading={!recipients}
              disabled={
                transfers[transfers.length - 1].percent_of_total_dropped === 100
              }
            >
              Add Distribution
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleLogRescue}
            flexGrow="1"
            flexBasis={isMobile ? '100%' : null}
            isLoading={working}
            disabled={!isValidRescue}
            loadingText="Creating Rescue..."
          >
            Log Rescue
          </Button>
        </Flex>
      )}
    </>
  )
}
