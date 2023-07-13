import { Button, Flex } from '@chakra-ui/react'
import { PageTitle } from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { getDefaultEndTime, getDefaultStartTime } from './ScheduleRescue.utils'
import { EMPTY_CATEGORIZED_WEIGHT, SE_API, STATUSES } from 'helpers'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { AddTransfer } from './ScheduleRescue.AddTransfer'
import { Transfers } from 'components/ScheduleRescue/ScheduleRescue.Transfers'
import { InfoForm } from './ScheduleRescue.InfoForm'

export function ScheduleRescue() {
  const params = new URLSearchParams(window.location.search)
  const duplicate_rescue_id = params.get('duplicate')
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

  const { data: duplicate_rescue } = useApi(
    duplicate_rescue_id ? `/rescues/get/${duplicate_rescue_id}` : null
  )

  const form_data_cache = sessionStorage.getItem(
    'se_create_rescue_form_data_cache'
  )
  const [formData, setFormData] = useState(
    form_data_cache
      ? JSON.parse(form_data_cache)
      : {
          timestamp_scheduled: getDefaultStartTime(),
          timestamp_scheduled_finish: getDefaultEndTime(),
          handler: null,
        }
  )

  const [view, setView] = useState(null)
  const [working, setWorking] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const transfers_cache = sessionStorage.getItem(
    'se_create_rescue_transfers_cache'
  )
  const [transfers, setTransfers] = useState(
    transfers_cache ? JSON.parse(transfers_cache) : []
  )

  useEffect(() => {
    if (duplicate_rescue) {
      duplicate_rescue.transfers.map(transfer => {
        setTransfers(currentTransfers => [
          ...currentTransfers,
          {
            type: transfer.type,
            organization: transfer.organization,
            location: transfer.location,
            organization_id: transfer.organization.id,
            location_id: transfer.location.id,
          },
        ])
      })
    }
  }, [duplicate_rescue])

  useEffect(() => {
    sessionStorage.setItem(
      'se_create_rescue_form_data_cache',
      JSON.stringify(formData)
    )
  }, [formData])

  useEffect(() => {
    transfers?.length
      ? sessionStorage.setItem(
          'se_create_rescue_transfers_cache',
          JSON.stringify(transfers)
        )
      : sessionStorage.removeItem('se_create_rescue_transfers_cache')
  }, [transfers])

  async function handleAddTransfer(transfer) {
    setTransfers(currentTransfers => [
      ...currentTransfers,
      {
        ...transfer,
        organization_id: transfer.organization.id,
        location_id: transfer.location.id,
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

  async function handleScheduleRescue() {
    setWorking(true)

    const rescue = await SE_API.post(
      `/rescues/create`,
      {
        type: 'retail',
        status: STATUSES.SCHEDULED,
        handler_id: formData.handler?.id || null,
        timestamp_scheduled: moment(formData.timestamp_scheduled).toISOString(),
        timestamp_completed: null,
        notes: '',
        transfers: transfers.map(transfer => ({
          type: transfer.type,
          organization_id: transfer.organization_id,
          location_id: transfer.location_id,
          status: STATUSES.SCHEDULED,
          handler_id: formData.handler?.id || null,
          notes: '',
          timestamp_completed: null,
          total_weight: 0,
          categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
          percent_of_total_dropped: 100,
        })),
      },
      user.accessToken
    )

    sessionStorage.removeItem('se_create_rescue_transfers_cache')
    sessionStorage.removeItem('se_create_rescue_form_data_cache')

    navigate(`/rescues/${rescue.id}`)
  }

  async function handleResetRescue() {
    await sessionStorage.removeItem('se_create_rescue_transfers_cache')
    await sessionStorage.removeItem('se_create_rescue_form_data_cache')
    setTransfers([])
  }

  const isValidRescue =
    formData.timestamp_scheduled &&
    transfers.length >= 2 &&
    transfers[0].type == 'collection' &&
    transfers[transfers.length - 1].type === 'distribution'

  return (
    <>
      <PageTitle>Schedule Rescue</PageTitle>
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
            >
              Add Distribution
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handleResetRescue}
            flexGrow="1"
            flexBasis={isMobile ? '100%' : null}
            background="green.secondary"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleScheduleRescue}
            flexGrow="1"
            flexBasis={isMobile ? '100%' : null}
            isLoading={working}
            disabled={!isValidRescue}
            loadingText="Creating Rescue..."
          >
            Schedule Rescue
          </Button>
        </Flex>
      )}
    </>
  )
}
