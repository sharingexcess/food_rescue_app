import { Button, Flex } from '@chakra-ui/react'
import { PageTitle, Pickup, Delivery } from 'components'
import { useApi, useAuth, useIsMobile } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { getDefaultEndTime, getDefaultStartTime } from './LogRescue.utils'
import {
  createTimestamp,
  FOOD_CATEGORIES,
  generateUniqueId,
  SE_API,
  STATUSES,
} from 'helpers'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { AddStop } from './LogRescue.AddStop'
import { Stops } from 'components/LogRescue/LogRescue.Stops'
import { InfoForm } from './LogRescue.InfoForm'

export function LogRescue() {
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
    'se_log_rescue_form_data_cache'
  )
  const [formData, setFormData] = useState(
    form_data_cache
      ? JSON.parse(form_data_cache)
      : {
          type: 'retail',
          timestamp_scheduled_start: getDefaultStartTime(),
          timestamp_scheduled_finish: getDefaultEndTime(),
          handler: null,
        }
  )
  const [view, setView] = useState(null)
  const [working, setWorking] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const stops_cache = sessionStorage.getItem('se_log_rescue_stops_cache')
  const [stops, setStops] = useState(stops_cache ? JSON.parse(stops_cache) : [])
  console.log(stops)

  const [activeStop, setActiveStop] = useState()

  useEffect(() => {
    sessionStorage.setItem(
      'se_log_rescue_form_data_cache',
      JSON.stringify(formData)
    )
  }, [formData])

  useEffect(() => {
    stops?.length
      ? sessionStorage.setItem(
          'se_log_rescue_stops_cache',
          JSON.stringify(stops)
        )
      : sessionStorage.removeItem('se_log_rescue_stops_cache')
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

  async function handleLogRescue() {
    setWorking(true)
    const id = await generateUniqueId('rescues')
    sessionStorage.removeItem('se_log_rescue_stops_cache')
    sessionStorage.removeItem('se_log_rescue_form_data_cache')

    await SE_API.post(
      `/rescues/${id}/create`,
      {
        formData: {
          handler_id: formData.handler?.id || null,
          stops,
          type: formData.type,
        },
        status_scheduled: STATUSES.COMPLETED,
        timestamp_scheduled_start: moment(
          formData.timestamp_scheduled_start
        ).toDate(),
        timestamp_scheduled_finish: moment(
          formData.timestamp_scheduled_finish
        ).toDate(),
        timestamp_created: createTimestamp(),
        timestamp_updated: createTimestamp(),
        timestamp_logged_start: moment(
          formData.timestamp_scheduled_start
        ).toDate(),
        timestamp_logged_finish: moment(
          formData.timestamp_scheduled_finish
        ).toDate(),
      },
      user.accessToken
    )
    navigate(`/rescues/${id}`)
  }

  function handleUpdatePickup(payload) {
    const updatedStop = {
      ...activeStop,
      ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}),
      status: STATUSES.COMPLETED,
      timestamp_logged_finish: createTimestamp(),
      timestamp_updated: createTimestamp(),
      notes: payload.notes,
      impact_data_total_weight: payload.total,
    }

    for (const row of payload.entryRows) {
      updatedStop[row.category] = updatedStop[row.category] + row.weight
    }
    const stop_index = stops.map(i => i.id).findIndex(i => i === payload.id)
    const updatedStops = [...stops]
    updatedStops[stop_index] = updatedStop
    setStops(updatedStops)
    setActiveStop(null)
  }

  function handleUpdateDelivery(payload) {
    const updatedDelivery = {
      ...activeStop,
      percent_of_total_dropped: payload.percentTotalDropped,
      notes: payload.notes,
      timestamp_logged_finish: createTimestamp(),
      timestamp_updated: createTimestamp(),
      status: STATUSES.COMPLETED,
    }

    const stop_index = stops.map(i => i.id).findIndex(i => i === payload.id)

    const current_load = {
      impact_data_dairy: 0,
      impact_data_bakery: 0,
      impact_data_produce: 0,
      impact_data_meat_fish: 0,
      impact_data_non_perishable: 0,
      impact_data_prepared_frozen: 0,
      impact_data_mixed: 0,
      impact_data_other: 0,
      impact_data_total_weight: 0,
    }

    for (const stop of stops.slice(0, stop_index)) {
      if (stop.type === 'pickup') {
        for (const category in current_load) {
          current_load[category] += stop[category]
        }
      } else {
        for (const category in current_load) {
          current_load[category] -= stop[category]
        }
      }
    }

    for (const key in current_load) {
      updatedDelivery[key] = Math.round(
        current_load[key] * (payload.percentTotalDropped / 100)
      )
    }

    const updatedStops = [...stops]
    updatedStops[stop_index] = updatedDelivery
    setStops(updatedStops)
    setActiveStop(null)
  }

  const isValidRescue =
    formData.handler &&
    formData.timestamp_scheduled_start &&
    formData.timestamp_scheduled_finish &&
    formData.timestamp_scheduled_start < formData.timestamp_scheduled_finish &&
    stops.length >= 2 &&
    stops[0].type == 'pickup' &&
    stops[stops.length - 1].type === 'delivery' &&
    stops[stops.length - 1].percent_of_total_dropped === 100 && // confirm that all remaining weight is handled in final delivery
    stops.reduce((total, curr) => total && curr.status === STATUSES.COMPLETED) // ensure all stops are completed

  return (
    <>
      <PageTitle>Log Rescue</PageTitle>
      <InfoForm
        formData={formData}
        setFormData={setFormData}
        handlers={handlers}
      />
      <Stops
        stops={stops}
        setStops={setStops}
        removeStop={removeStop}
        setActiveStop={setActiveStop}
      />
      {activeStop?.type === 'pickup' ? (
        <Pickup
          pickup={activeStop}
          handleSubmitOverride={handleUpdatePickup}
          handleClosePickupOverride={() => setActiveStop(null)}
        />
      ) : activeStop?.type === 'delivery' ? (
        <Delivery
          delivery={activeStop}
          rescueOverride={{ stops }}
          handleCloseDeliveryOverride={() => setActiveStop(null)}
          handleSubmitOverride={handleUpdateDelivery}
        />
      ) : null}
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
              disabled={
                stops[stops.length - 1].percent_of_total_dropped === 100
              }
            >
              Add Delivery
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
