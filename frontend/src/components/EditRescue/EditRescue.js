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
    timestamp_scheduled_start: '',
    timestamp_scheduled_finish: '',
    handler: null,
  })
  const [view, setView] = useState(null)
  const [working, setWorking] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const [stops, setStops] = useState()

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
        timestamp_scheduled_start: formatTimestamp(
          rescue.timestamp_scheduled_start,
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

  function removeStop(index) {
    if (window.confirm('Are you sure you want to remove this stop?')) {
      setStops([...stops.slice(0, index), ...stops.slice(index + 1)])
    }
  }

  async function handleUpdateRescue() {
    setWorking(true)

    await SE_API.post(
      `/rescues/${rescue_id}/create`,
      {
        formData: {
          handler_id: formData.handler?.id || null,
          stops,
          is_direct_link: false,
        },
        status_scheduled: rescue.status,
        timestamp_scheduled_start: moment(
          formData.timestamp_scheduled_start
        ).toDate(),
        timestamp_scheduled_finish: moment(
          formData.timestamp_scheduled_finish
        ).toDate(),
        timestamp_created: createTimestamp(),
        timestamp_updated: createTimestamp(),
        timestamp_logged_start: rescue?.timestamp_logged_start
          ? rescue.timestamp_logged_start
          : null,
      },
      user.accessToken
    )
    navigate(`/rescues/${rescue_id}`)
  }

  const isValidRescue =
    formData.timestamp_scheduled_start &&
    formData.timestamp_scheduled_finish &&
    formData.timestamp_scheduled_start < formData.timestamp_scheduled_finish &&
    stops.length >= 2 &&
    stops[0].type == 'pickup' &&
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
