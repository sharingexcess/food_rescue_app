import { Box, Button, Flex, Skeleton } from '@chakra-ui/react'
import { PageTitle } from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { memo, useEffect, useMemo, useState } from 'react'
import {
  createTimestamp,
  formatTimestamp,
  generateUniqueId,
  SE_API,
  STATUSES,
} from 'helpers'
import moment from 'moment'
import { useNavigate, useParams } from 'react-router-dom'
import { InfoForm } from './EditRescue.InfoForm'
import { AddStop } from './EditRescue.AddStop'
import { Stops } from './EditRescue.Stops'

export function EditRescue({ setBreadcrumbs }) {
  const { user } = useAuth()
  const { rescue_id } = useParams()
  const { data: rescue } = useApi(`/rescues/${rescue_id}`)
  const { data: handlers } = useApi('/publicProfiles')
  const { data: donors } = useApi(
    '/organizations',
    useMemo(() => ({ type: 'donor' }), [])
  )
  const { data: recipients } = useApi(
    '/organizations',
    useMemo(() => ({ type: 'recipient' }), [])
  )
  const [formData, setFormData] = useState({
    timestamp_scheduled: '',
    timestamp_scheduled_finish: '',
    handler: null,
  })
  const [view, setView] = useState(null)
  const [working, setWorking] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const [stops, setStops] = useState()
  const [stopsToDelete, setStopsToDelete] = useState([])

  useEffect(() => {
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
    if (rescue && !stops) {
      setFormData({
        timestamp_scheduled: formatTimestamp(
          rescue.timestamp_scheduled,
          'YYYY-MM-DDTHH:mm'
        ),
        timestamp_scheduled_finish: formatTimestamp(
          rescue.timestamp_scheduled_finish,
          'YYYY-MM-DDTHH:mm'
        ),
        handler: rescue.handler,
      })
      setStops(rescue.stops)
    }
  }, [rescue])

  async function handleAddStop(stop) {
    const id = await generateUniqueId('stops')
    setStops(currentStops => [
      ...currentStops,
      {
        ...stop,
        id,
        organization_id: stop.organization.id,
        location_id: stop.location.id,
        status: STATUSES.SCHEDULED,
      },
    ])
    setView(null)
  }

  function removeStop(id) {
    if (
      window.confirm(
        'Are you sure you want to delete this stop? This cannot be undone.'
      )
    ) {
      const stop = stops.find(s => s.id === id)
      setStops(stops.filter(s => s.id !== id))
      setStopsToDelete(stops => [...stops, stop])
    }
  }

  async function handleDeleteStop(stop) {
    await SE_API.post(
      `/rescues/${rescue_id}/${stop.type}/${stop.id}/cancel`,
      {
        status: STATUSES.SCHEDULED,
        is_deleted: true,
      },
      user.accessToken
    )
  }

  async function handleUpdateRescue() {
    setWorking(true)

    if (stopsToDelete.length) {
      for (const stop of stopsToDelete) {
        await handleDeleteStop(stop)
      }
    }

    const promises = []
    const defaultPayload = {
      timestamp_scheduled: moment(formData.timestamp_scheduled).toDate(),
      timestamp_scheduled_finish: moment(
        formData.timestamp_scheduled_finish
      ).toDate(),
      timestamp_updated: createTimestamp(),
      handler_id: formData.handler?.id || null,
    }

    const newStops = stops.filter(i => !rescue.transfer_ids.includes(i.id))

    for (const stop of newStops) {
      const payload = {
        id: stop.id,
        type: stop.type,
        rescue_id: rescue.id,
        organization_id: stop.organization.id,
        location_id: stop.location.id,
        status: STATUSES.SCHEDULED,
        notes: '',
        dairy: 0,
        bakery: 0,
        produce: 0,
        meat_fish: 0,
        non_perishable: 0,
        prepared_frozen: 0,
        mixed: 0,
        other: 0,
        total_weight: 0,
        timestamp_created: createTimestamp(),
        timestamp_logged_start: null,
        timestamp_logged_finish: null,
        ...defaultPayload,
      }
      if (stop.type === 'delivery') {
        stop.percent_of_total_dropped = 100
      }
      await SE_API.post(`/stops/${stop.id}/create`, payload, user.accessToken)
    }

    if (rescue.status === STATUSES.ACTIVE) {
      let activeStop = null
      for (const stop of stops) {
        if ([STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(stop.status)) {
          if (activeStop) {
            promises.push(
              SE_API.post(
                `/stops/${stop.id}/update`,
                { ...defaultPayload, status: STATUSES.SCHEDULED },
                user.accessToken
              )
            )
          } else {
            activeStop = stop
            promises.push(
              SE_API.post(
                `/stops/${stop.id}/update`,
                {
                  ...defaultPayload,
                  status: STATUSES.ACTIVE,
                  timestamp_logged_start: createTimestamp(),
                },
                user.accessToken
              )
            )
          }
        } else {
          promises.push(
            SE_API.post(
              `/stops/${stop.id}/update`,
              defaultPayload,
              user.accessToken
            )
          )
        }
      }
    } else {
      for (const stop of stops) {
        promises.push(
          SE_API.post(
            `/stops/${stop.id}/update`,
            defaultPayload,
            user.accessToken
          )
        )
      }
    }

    await Promise.all(promises)

    // make the rescue update call last, after all stops are updated
    // this is to ensure that the final recalculation happens
    // without risking race conditions
    await SE_API.post(
      `/rescues/${rescue_id}/update`,
      { ...defaultPayload, transfer_ids: stops.map(i => i.id) },
      user.accessToken
    )
    navigate(`/rescues/${rescue_id}`)
  }

  // should be for remaining stops only for active routes
  // keep the same for inactive routes
  // for scheduled routes, don't have cancel stops (don't show canceled stops for scheduled routes)
  // be able to remove (not mark as cancelled) stops with an x in top right when editing rescue (for scheduled rescues that have not been started) (FOR ALL RESCUES)
  const isValidRescue =
    formData.timestamp_scheduled &&
    formData.timestamp_scheduled_finish &&
    formData.timestamp_scheduled < formData.timestamp_scheduled_finish &&
    stops.length >= 2 &&
    stops.filter(s => s.status !== STATUSES.CANCELLED && !s.is_deleted)[0]
      ?.type == 'pickup' &&
    stops[stops.length - 1].type === 'delivery'

  if (!rescue) return <LoadingEditRescue />

  return (
    <>
      <PageTitle>Edit Rescue</PageTitle>
      <InfoForm
        formData={formData}
        setFormData={setFormData}
        handlers={handlers}
      />
      <Stops stops={stops} setStops={setStops} removeStop={removeStop} />
      {view ? (
        <AddStop
          type={view}
          handleAddStop={handleAddStop}
          handleCancel={() => setView(null)}
          organizations={
            view === 'pickup' ? donors : view === 'delivery' ? recipients : null
          }
        />
      ) : (
        <Flex w="100%" gap="4" mt="8" mb="4" justify="center" wrap="wrap">
          <Button
            variant="secondary"
            onClick={() => setView('pickup')}
            flexGrow={isMobile ? '1' : '0'}
            background="blue.secondary"
            color="blue.primary"
            isLoading={!donors}
          >
            {stops?.length === 0 ? 'Add Stops' : 'Add Pickup'}
          </Button>
          {stops?.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setView('delivery')}
              flexGrow={isMobile ? '1' : '0'}
              isLoading={!recipients}
            >
              Add Delivery
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
