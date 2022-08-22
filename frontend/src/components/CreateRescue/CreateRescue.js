import { Button, Flex } from '@chakra-ui/react'
import { PageTitle } from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { getDefaultEndTime, getDefaultStartTime } from './CreateRescue.utils'
import { createTimestamp, generateUniqueId, SE_API, STATUSES } from 'helpers'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { AddStop } from './CreateRescue.AddStop'
import { Stops } from 'components/CreateRescue/CreateRescue.Stops'
import { InfoForm } from './CreateRescue.InfoForm'

export function CreateRescue() {
  const { user } = useAuth()
  const { data: handlers } = useApi('/publicProfiles')
  const { data: donors } = useApi(
    '/organizations',
    useMemo(() => ({ type: 'donor' }), [])
  )
  const { data: recipients } = useApi(
    '/organizations',
    useMemo(() => ({ type: 'recipient' }), [])
  )

  const form_data_cache = sessionStorage.getItem(
    'se_create_rescue_form_data_cache'
  )
  const [formData, setFormData] = useState(
    form_data_cache
      ? JSON.parse(form_data_cache)
      : {
          timestamp_scheduled_start: getDefaultStartTime(),
          timestamp_scheduled_finish: getDefaultEndTime(),
          handler: null,
        }
  )
  const [view, setView] = useState(null)
  const [working, setWorking] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const stops_cache = sessionStorage.getItem('se_create_rescue_stops_cache')
  const [stops, setStops] = useState(stops_cache ? JSON.parse(stops_cache) : [])

  useEffect(() => {
    sessionStorage.setItem(
      'se_create_rescue_form_data_cache',
      JSON.stringify(formData)
    )
  }, [formData])

  useEffect(() => {
    stops?.length
      ? sessionStorage.setItem(
          'se_create_rescue_stops_cache',
          JSON.stringify(stops)
        )
      : sessionStorage.removeItem('se_create_rescue_stops_cache')
  }, [stops])

  async function handleAddStop(stop) {
    const id = await generateUniqueId('stops')
    setStops(currentStops => [
      ...currentStops,
      {
        ...stop,
        id,
        organization_id: stop.organization.id,
        location_id: stop.location.id,
      },
    ])
    setView(null)
  }

  function removeStop(index) {
    if (window.confirm('Are you sure you want to remove this stop?')) {
      setStops([...stops.slice(0, index), ...stops.slice(index + 1)])
    }
  }

  async function handleCreateRescue() {
    setWorking(true)
    const id = await generateUniqueId('rescues')
    sessionStorage.removeItem('se_create_rescue_stops_cache')
    sessionStorage.removeItem('se_create_rescue_form_data_cache')

    await SE_API.post(
      `/rescues/${id}/create`,
      {
        formData: {
          handler_id: formData.handler?.id || null,
          stops,
          is_direct_link: false,
        },
        status_scheduled: STATUSES.SCHEDULED,
        timestamp_scheduled_start: moment(
          formData.timestamp_scheduled_start
        ).toDate(),
        timestamp_scheduled_finish: moment(
          formData.timestamp_scheduled_finish
        ).toDate(),
        timestamp_created: createTimestamp(),
        timestamp_updated: createTimestamp(),
      },
      user.accessToken
    )
    navigate(`/rescues/${id}`)
  }

  const isValidRescue =
    formData.timestamp_scheduled_start &&
    formData.timestamp_scheduled_finish &&
    formData.timestamp_scheduled_start < formData.timestamp_scheduled_finish &&
    stops.length >= 2 &&
    stops[0].type == 'pickup' &&
    stops[stops.length - 1].type === 'delivery'

  return (
    <>
      <PageTitle>Create Rescue</PageTitle>
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
            {stops.length === 0 ? 'Add Stops' : 'Add Pickup'}
          </Button>
          {stops.length > 0 && (
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
            onClick={handleCreateRescue}
            flexGrow="1"
            flexBasis={isMobile ? '100%' : null}
            isLoading={working}
            disabled={!isValidRescue}
            loadingText="Creating Rescue..."
          >
            Create Rescue
          </Button>
        </Flex>
      )}
    </>
  )
}
