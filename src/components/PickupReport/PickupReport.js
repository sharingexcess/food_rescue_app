import React, { useCallback, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Loading, Input } from 'components'
import { createServerTimestamp, setFirestoreData } from 'helpers'
import { useFirestore, useAuth, useApp } from 'hooks'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import validator from 'validator'

export function PickupReport({ customSubmitHandler }) {
  const { pickup_id, route_id } = useParams()
  const { setModal, setModalState } = useApp()
  const route = useFirestore('routes', route_id)
  const { admin } = useAuth()
  const history = useHistory()
  const pickup = useFirestore('pickups', pickup_id)
  const pickupsOnRoute = useFirestore(
    'pickups',
    useCallback(p => p.route_id === route_id, [route_id])
  )
  const deliveries = useFirestore(
    'deliveries',
    useCallback(d => d.pickup_ids && d.pickup_ids.includes(pickup_id), [
      pickup_id,
    ])
  )
  const [formData, setFormData] = useState({
    dairy: 0,
    bakery: 0,
    produce: 0,
    'meat/Fish': 0,
    'non-perishable': 0,
    'prepared/Frozen': 0,
    'mixed groceries': 0,
    other: 0,
    weight: 0,
    notes: '',
  })
  const [changed, setChanged] = useState(false)
  const [errors, setErrors] = useState([])
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    pickup && pickup.report
      ? setFormData(formData => ({ ...formData, ...pickup.report }))
      : setChanged(true)
  }, [pickup])

  useEffect(() => {
    setFormData(formData => ({ ...formData, weight: sumWeight(formData) }))
  }, [errors])

  const canEdit = (pickup && [1, 3, 6].includes(pickup.status)) || admin

  function sumWeight(object) {
    let sum = 0
    for (const field in object) {
      if (['weight', 'notes', 'created_at', 'updated_at'].includes(field)) {
        //pass
      } else {
        sum += parseFloat(object[field])
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
    updated.weight = sumWeight(updated)
    setErrors([])
    setShowErrors(false)
    setFormData(updated)
    setChanged(true)
  }

  function validateFormData(data) {
    const currErrors = []
    if (isNaN(data.weight) || /\s/g.test(data.weight)) {
      currErrors.push('Invalid Input: Total Weight is not a number')
    }
    if (data.weight < 0) {
      errors.push('Invalid Input: Total Weight must be greater than zero')
    }
    for (const field in data) {
      if (
        field !== 'weight' &&
        field !== 'notes' &&
        field !== 'created_at' &&
        field !== 'updated_at' &&
        !validator.isInt(data[field].toString()) &&
        data.field < 0
      ) {
        errors.push('Invalid Input: Item weight is not valid')
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
      if (route.status === 9) {
        // handle updating completed route
        try {
          for (const d of deliveries) {
            const otherPickupsInDelivery = pickupsOnRoute.filter(
              p =>
                d.pickup_ids.includes(p.id) &&
                p.id !== pickup_id &&
                p.status === 9
            )
            let totalWeight = formData.weight
            for (const pickup of otherPickupsInDelivery) {
              totalWeight += pickup.report.weight
            }
            await setFirestoreData(['Deliveries', d.id], {
              report: {
                updated_at: createServerTimestamp(),
                weight: (d.report.percent_of_total_dropped / 100) * totalWeight,
              },
            })
          }
        } catch (e) {
          console.error(e)
          alert(
            'Whoops! Unable to recalculate analytics data for this route. Contact an admin with this route_id!'
          )
        }
      }

      setFirestoreData(['Pickups', pickup_id], {
        report: {
          dairy: parseInt(data.dairy),
          bakery: parseInt(data.bakery),
          produce: parseInt(data.produce),
          'meat/Fish': parseInt(data['meat/Fish']),
          'non-perishable': parseInt(data['non-perishable']),
          'prepared/Frozen': parseInt(data['prepared/Frozen']),
          'mixed groceries': parseInt(data['mixed groceries']),
          other: parseInt(data.other),
          weight: parseInt(data.weight),
          notes: data.notes,
          created_at: pickup.completed_at || createServerTimestamp(),
          updated_at: createServerTimestamp(),
        },
        status: 9,
        time_finished: createServerTimestamp(),
        driver_completed_at: createServerTimestamp(),
      })
        .then(() => history.push(`/routes/${route_id}`))
        .catch(e => console.error('Error writing document: ', e))
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
        Use this form to enter data on what food was available for rescue.
      </Text>
      <Spacer height={16} />
      <Button
        fullWidth
        color="white"
        type="primary"
        handler={() => {
          setModal('Calculator')
          setModalState({ setFormData: setFormData })
        }}
      >
        Open Calculator
      </Button>
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
          !['weight', 'notes', 'created_at', 'updated_at'].includes(field) ? (
            <section key={field}>
              <Text type="small-header" color="white" shadow>
                {field}
              </Text>
              <input
                id={field}
                type="number"
                value={formData[field] === 0 ? '' : formData[field]}
                onChange={handleChange}
                readOnly={!canEdit}
              />
            </section>
          ) : null
        )}
      <section className="weight">
        <Text type="section-header" color="white" shadow>
          Total Weight
        </Text>
        {isNaN(formData.weight) ? (
          <Text type="small" color="white" align="right" shadow>
            Error calculating weight!
          </Text>
        ) : (
          <h6>{formData.weight}</h6>
        )}
      </section>
      <Input
        type="textarea"
        label="Notes..."
        element_id="notes"
        row={3}
        value={formData.notes}
        onChange={handleChange}
        readOnly={!canEdit}
      />
      <FormError />
      {changed && canEdit ? (
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
