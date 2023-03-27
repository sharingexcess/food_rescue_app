import { Button, Flex } from '@chakra-ui/react'
import { PageTitle, Collection, Distribution } from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { getDefaultStartTime } from './LogRescue.utils'
import {
  createTimestamp,
  EMPTY_CATEGORIZED_WEIGHT,
  generateUniqueId,
  SE_API,
  STATUSES,
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
          timestamp_scheduled: getDefaultStartTime(),
          handler: null,
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
        ...transfer,
        status: STATUSES.SCHEDULED,
        organization_id: transfer.organization.id,
        location_id: transfer.location.id,
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
    const id = await generateUniqueId('rescues')
    sessionStorage.removeItem('se_log_rescue_transfers_cache')
    sessionStorage.removeItem('se_log_rescue_form_data_cache')

    await SE_API.post(
      `/rescues/${id}/create`,
      {
        formData: {
          handler_id: formData.handler?.id || null,
          transfers,
          type: formData.type,
        },
        status_scheduled: STATUSES.COMPLETED,
        timestamp_scheduled: moment(formData.timestamp_scheduled).toDate(),
        timestamp_scheduled_finish: moment(
          formData.timestamp_scheduled_finish
        ).toDate(),
        timestamp_created: createTimestamp(),
        timestamp_updated: createTimestamp(),
        timestamp_logged_start: moment(formData.timestamp_scheduled).toDate(),
        timestamp_logged_finish: moment(
          formData.timestamp_scheduled_finish
        ).toDate(),
      },
      user.accessToken
    )
    navigate(`/rescues/${id}`)
  }

  function handleUpdateCollection({ entryRows, notes, total, id }) {
    const updatedTransfer = {
      ...activeTransfer,
      id,
      handler_id: formData.handler.id,
      status: STATUSES.COMPLETED,
      timestamp_completed: moment(formData.timestamp_scheduled).toISOString(),
      notes: notes,
      total_weight: total,
      categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
    }

    for (const row of entryRows) {
      updatedTransfer.categorized_weight[row.category] =
        updatedTransfer.categorized_weight[row.category] + row.weight
    }

    const transfer_index = transfers.findIndex(i => i.id === id)
    const updatedTransfers = [...transfers]
    updatedTransfers[transfer_index] = updatedTransfer

    setTransfers(updatedTransfers)
    setActiveTransfer(null)
  }

  function handleUpdateDistribution(payload) {
    const updatedDistribution = {
      ...activeTransfer,
      percent_of_total_dropped: payload.percentTotalDropped,
      notes: payload.notes,
      timestamp_logged_finish: createTimestamp(),
      timestamp_updated: createTimestamp(),
      status: STATUSES.COMPLETED,
    }

    const transfer_index = transfers
      .map(i => i.id)
      .findIndex(i => i === payload.id)

    const current_load = {
      dairy: 0,
      bakery: 0,
      produce: 0,
      meat_fish: 0,
      non_perishable: 0,
      prepared_frozen: 0,
      mixed: 0,
      other: 0,
      total_weight: 0,
    }

    for (const transfer of transfers.slice(0, transfer_index)) {
      if (transfer.type === 'collection') {
        for (const category in current_load) {
          current_load[category] += transfer[category]
        }
      } else {
        for (const category in current_load) {
          current_load[category] -= transfer[category]
        }
      }
    }

    for (const key in current_load) {
      updatedDistribution[key] = Math.round(
        current_load[key] * (payload.percentTotalDropped / 100)
      )
    }

    const updatedTransfers = [...transfers]
    updatedTransfers[transfer_index] = updatedDistribution
    setTransfers(updatedTransfers)
    setActiveTransfer(null)
  }

  const isValidRescue =
    formData.handler &&
    formData.timestamp_scheduled &&
    formData.timestamp_scheduled_finish &&
    formData.timestamp_scheduled < formData.timestamp_scheduled_finish &&
    transfers.length >= 2 &&
    transfers[0].type == 'collection' &&
    transfers[transfers.length - 1].type === 'distribution' &&
    transfers[transfers.length - 1].percent_of_total_dropped === 100 && // confirm that all remaining weight is handled in final distribution
    transfers.reduce(
      (total, curr) => total && curr.status === STATUSES.COMPLETED
    ) // ensure all transfers are completed

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
      {activeTransfer?.type === 'collection' ? (
        <Collection
          collection={activeTransfer}
          handleSubmitOverride={handleUpdateCollection}
          handleCloseCollectionOverride={() => setActiveTransfer(null)}
        />
      ) : activeTransfer?.type === 'distribution' ? (
        <Distribution
          distribution={activeTransfer}
          rescueOverride={{ transfers }}
          handleCloseDistributionOverride={() => setActiveTransfer(null)}
          handleSubmitOverride={handleUpdateDistribution}
        />
      ) : null}
      {view ? (
        <AddTransfer
          type={view}
          handleAddTransfer={handleAddTransfer}
          handleCancel={() => setView(null)}
          organizations={
            view === 'collection'
              ? donors
              : view === 'distribution'
              ? recipients
              : null
          }
        />
      ) : (
        <Flex w="100%" gap="4" mt="8" mb="4" justify="center" wrap="wrap">
          <Button
            variant="secondary"
            onClick={() => setView('collection')}
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
              onClick={() => setView('distribution')}
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
