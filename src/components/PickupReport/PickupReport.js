import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Loading, Input } from 'components'
import {
  createTimestamp,
  FOOD_CATEGORIES,
  setFirestoreData,
  STATUSES,
  updateImpactDataForRescue,
} from 'helpers'
import { useFirestore, useApp } from 'hooks'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import validator from 'validator'
import { useSessionStorageString } from 'react-use-window-sessionstorage'

export function PickupReport({ customSubmitHandler }) {
  const { pickup_id, rescue_id } = useParams()
  const { setModal, setModalState } = useApp()
  const rescue = useFirestore('rescues', rescue_id)
  const history = useHistory()
  const pickup = useFirestore('stops', pickup_id)
  const [formData, setFormData] = useState({
    ...FOOD_CATEGORIES.reduce((acc, curr) => ((acc[curr] = 0), acc), {}), // eslint-disable-line
    impact_data_total_weight: 0,
    notes: '',
  })
  const [changed, setChanged] = useState(false)
  const [errors, setErrors] = useState([])
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    pickup && pickup.id
      ? setFormData(formData => ({
          ...formData,
          ...FOOD_CATEGORIES.reduce(
            (acc, curr) => ((acc[curr] = pickup[curr]), acc), // eslint-disable-line
            {}
          ),
          impact_data_total_weight: pickup.impact_data_total_weight,
        }))
      : setChanged(true) // if this is a new report, display submit button immediately
  }, [pickup])

  useEffect(() => {
    setFormData(formData => ({
      ...formData,
      impact_data_total_weight: sumWeight(formData),
    }))
  }, [errors])

  useEffect(() => {
    const formDataString = JSON.stringify(formData)
    window.sessionStorage.setItem(`pick_up_${pickup_id}`, formDataString)
    //console.log(`formData_${formDataString}`)
  }, [formData])

  useEffect(() => {
    const savedFormData = window.sessionStorage.getItem(`pick_up_${pickup_id}`)
    //console.log(`savedFormData_${savedFormData}`)
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
    }
  }, [])

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
    setErrors([])
    setShowErrors(false)
    setFormData(updated)
    setChanged(true)
  }

  function validateFormData(data) {
    const currErrors = []
    if (
      isNaN(data.impact_data_total_weight) ||
      /\s/g.test(data.impact_data_total_weight)
    ) {
      currErrors.push('Invalid Input: Total Weight is not a number')
    }
    if (data.impact_data_total_weight < 0) {
      errors.push('Invalid Input: Total Weight must be greater than zero')
    }
    for (const field in data) {
      if (
        field !== 'impact_data_total_weight' &&
        field !== 'notes' &&
        !validator.isInt(data[field].toString()) &&
        data.field < 0
      ) {
        errors.push('Invalid Input: Total Weight is not valid')
        break
      }
    }

    if (currErrors.length === 0) {
      return true
    }
    setErrors(currErrors)
    return false
  }

  function FormError() {
    if (showErrors === true) {
      return errors.map(error => <p id="FormError">{error}</p>)
    } else return null
  }

  async function handleSubmit(event, data) {
    event.preventDefault()
    if (validateFormData(data)) {
      try {
        await setFirestoreData(['stops', pickup_id], {
          ...formData,
          status: STATUSES.COMPLETED,
          timestamp_updated: createTimestamp(),
          timestamp_logged_finish: createTimestamp(),
        })
        if (rescue.status === STATUSES.COMPLETED) {
          await updateImpactDataForRescue(rescue)
        }
        history.push(`/rescues/${rescue_id}`)
      } catch (e) {
        console.error('Error writing document: ', e)
      }
    } else {
      setShowErrors(true)
    }
  }

  if (!pickup) return <Loading text="Loading report" />

  return (
    <main id="PickupReport">
      <Text type="section-header" color="white" shadow>
        Pickup Report
      </Text>
      <Spacer height={4} />

      <Text type="subheader" color="white" shadow>
        Please request scale from donor prior to filling out this report. Weigh
        each box, noting that box's variety, and fill in total pounds for each
        category below.<br></br> <br></br>
        For additional instructions on how to fill out the pickup report, press
        the i button.
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
                {field.replace('impact_data_', '').replace('_', ' ')}
              </Text>
              <input
                id={field}
                type="number"
                value={formData[field] === 0 ? '' : formData[field]}
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
      <FormError />
      {changed ? (
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
          {pickup.report ? 'Update Report' : 'Submit Report'}
        </Button>
      ) : null}
    </main>
  )
}
