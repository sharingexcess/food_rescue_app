import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loading, Input } from 'components'
import {
  API_URL,
  createTimestamp,
  FOOD_CATEGORIES,
  SE_API,
  STATUSES,
} from 'helpers'
import { useApp, useApi, useAuth } from 'hooks'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import { isFormDataEqual } from './utils'

const initFormData = {
  ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
  impact_data_total_weight: 0,
  notes: '',
}

let debounce_timer
const DEBOUNCE_INTERVAL = 2000

export function PickupReport({ customSubmitHandler }) {
  const { pickup_id, rescue_id } = useParams()
  // this code is shared by it's own view "/rescue/:id/pickup/:id"
  // but also the LogRescue component, so it must handle both the case
  // where a pickup_id is present in the url, and where it is
  // creating a new pickup
  const { data: pickup, refresh } = useApi(
    pickup_id ? `/stops/${pickup_id}` : null
  )
  const [formData, setFormData] = useState(initFormData)
  const [changed, setChanged] = useState(false)
  const [updatedFromDb, setUpdatedFromDb] = useState(false)
  const { setModal, setModalState } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (pickup && pickup.id && !updatedFromDb) {
      setFormData(formData => ({
        ...formData,
        impact_data_dairy: pickup.impact_data_dairy || 0,
        impact_data_bakery: pickup.impact_data_bakery || 0,
        impact_data_produce: pickup.impact_data_produce || 0,
        impact_data_meat_fish: pickup.impact_data_meat_fish || 0,
        impact_data_non_perishable: pickup.impact_data_non_perishable || 0,
        impact_data_prepared_frozen: pickup.impact_data_prepared_frozen || 0,
        impact_data_mixed: pickup.impact_data_mixed || 0,
        impact_data_other: pickup.impact_data_other || 0,
        impact_data_total_weight: pickup.impact_data_total_weight || 0,
        notes: pickup.notes || '',
      }))
      setUpdatedFromDb(true)
    }
  }, [pickup, pickup_id, updatedFromDb])

  useEffect(() => {
    if (
      !isFormDataEqual(formData, initFormData) &&
      !isFormDataEqual(formData, pickup) &&
      changed &&
      pickup_id
    ) {
      debounce_timer && window.clearTimeout(debounce_timer)
      debounce_timer = setTimeout(handleUpdateStop, DEBOUNCE_INTERVAL)
    }
  }, [pickup, formData, pickup_id, changed])

  async function handleUpdateStop() {
    await SE_API.post(`/stops/${pickup_id}/update`, {
      ...formData,
      status: STATUSES.COMPLETED,
      timestamp_logged_finish: createTimestamp(),
    })
    refresh()
  }

  function openAddToCategory(field) {
    setModal('AddToCategory')
    setModalState({ setFormData, sumWeight, field })
  }

  function sumWeight(object) {
    let sum = 0
    for (const field in object) {
      if (['impact_data_total_weight', 'notes'].includes(field)) {
        //pass
      } else {
        sum += parseInt(object[field])
      }
    }
    return sum
  }

  function handleChange(e) {
    const updated = {
      ...formData,
      [e.target.id]:
        e.target.id === 'notes'
          ? e.target.value
          : parseInt(e.target.value) || 0,
    }
    updated.impact_data_total_weight = sumWeight(updated)
    setFormData(updated)
    setChanged(true)
  }

  async function handleSubmit(event, data) {
    event.preventDefault()
    await handleUpdateStop()
    navigate(`/rescues/${rescue_id}`)
  }

  if (pickup_id && !pickup) return <Loading text="Loading report" />

  return (
    <main id="PickupReport">
      <Text type="section-header" color="white" shadow>
        Pickup Report
      </Text>
      <Spacer height={4} />

      <Text type="subheader" color="white" shadow>
        Weigh each box by category, and use the "+" button to add to the
        category total.
        <Button
          id="Pickup-report-instructions"
          type="tertiary"
          color="white"
          handler={() => {
            setModal('PickupReportInstructions')
          }}
        >
          <i className="fa fa-info-circle" />
        </Button>
      </Text>
      <Spacer height={32} />

      {Object.keys(formData)
        .sort(function (a, b) {
          if (a === 'other') {
            return 1
          }
          if (b === 'other') {
            return -1
          }
          return a.localeCompare(b)
        })
        .map(field =>
          !['impact_data_total_weight', 'notes'].includes(field) ? (
            <section key={field}>
              <Text type="small-header" color="white" shadow>
                {field === 'impact_data_non_perishable'
                  ? field.replace('impact_data_', '').replace('_', ' ')
                  : field.replace('impact_data_', '').replace('_', ' / ')}
              </Text>
              <input
                id={field}
                type="number"
                value={formData[field] === 0 ? '' : formData[field]}
                onWheel={e => e.target.blur()}
                onChange={handleChange}
              />
              <Button
                type="primary"
                color="white"
                size="small"
                handler={() => openAddToCategory(field)}
              >
                +
              </Button>
            </section>
          ) : null
        )}
      <section className="weight">
        <Text type="section-header" color="white" shadow>
          Total Weight
        </Text>
        {isNaN(formData.impact_data_total_weight) ? (
          <Text type="small" color="white" align="right" shadow>
            Error calculating impact_data_total_weight!
          </Text>
        ) : (
          <h6>{formData.impact_data_total_weight}</h6>
        )}
      </section>
      <Input
        type="textarea"
        label="Notes..."
        element_id="notes"
        row={3}
        value={formData.notes}
        onChange={handleChange}
      />
      <Button
        type="primary"
        color="white"
        size="large"
        fullWidth
        handler={
          customSubmitHandler
            ? e => customSubmitHandler(e, formData)
            : e => handleSubmit(e, formData)
        }
      >
        {pickup ? 'Update Report' : 'Submit Report'}
      </Button>
      <Spacer height={32} />
      <Button
        type="tertiary"
        color="white"
        size="large"
        fullWidth
        handler={() => setModal('NeedHelp')}
      >
        Need Help ?
      </Button>
    </main>
  )
}
