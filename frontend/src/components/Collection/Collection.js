import { CardOverlay, useRescueContext } from 'components'
import {
  EMPTY_CATEGORIZED_WEIGHT,
  FOOD_CATEGORIES,
  SE_API,
  STATUSES,
  TRANSFER_TYPES,
} from 'helpers'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CollectionFooter } from './Collection.Footer'
import { CollectionBody } from './Collection.Body'
import { CollectionHeader } from './Collection.Header'
import { useAuth } from 'hooks'
import moment from 'moment'

const CollectionContext = createContext({})
CollectionContext.displayName = 'CollectionContext'
export const useCollectionContext = () => useContext(CollectionContext)

export function Collection({
  collection,
  handleCloseCollectionOverride,
  handleSubmitOverride,
}) {
  const { user } = useAuth()
  const { setOpenTransfer, rescue, refresh } = useRescueContext()
  const [entryRows, setEntryRows] = useState([])
  const [notes, setNotes] = useState('')
  const [completedAt, setCompletedAt] = useState()

  const session_storage_key = useMemo(
    () => (collection ? `collection_cache_${collection.id}` : undefined),
    [collection]
  )
  const isChanged = window.sessionStorage.getItem(session_storage_key)

  useEffect(() => {
    const sessionObject = sessionStorage.getItem(session_storage_key)

    if (sessionObject) {
      const { sessionEntryRows, sessionNotes } = JSON.parse(sessionObject)
      setEntryRows(sessionEntryRows)
      setNotes(sessionNotes)
    } else if (collection) {
      const initialEntryRows = []
      for (const category of FOOD_CATEGORIES) {
        if (collection?.categorized_weight[category]) {
          initialEntryRows.push({
            category: category,
            weight: collection.categorized_weight[category],
          })
        }
      }
      setEntryRows(initialEntryRows)
      setNotes(collection.notes)
      setCompletedAt(collection.timestamp_completed)
    }
  }, [collection])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const total = entryRows.reduce((total, current) => total + current.weight, 0)

  async function handleSubmit() {
    const payload = {
      type: TRANSFER_TYPES.COLLECTION,
      status: STATUSES.COMPLETED,
      organization_id: collection.organization_id,
      location_id: collection.location_id,
      notes,
      timestamp_completed:
        // automatically set timestamp completed if this is being submitted for the first time
        collection.status === STATUSES.SCHEDULED
          ? moment().toISOString()
          : moment(completedAt).toISOString(),
      total_weight: 0,
      categorized_weight: EMPTY_CATEGORIZED_WEIGHT(),
    }

    // add the id and rescue data to the payload
    // note: we do this separately to account for "LogRescue"
    // which uses this component to build a collection
    // before it's created in the db (hence there's no id)
    if (collection.id) {
      payload.id = collection.id
    }
    if (rescue) {
      payload.rescue_id = rescue.id
      payload.handler_id = rescue.handler_id
    }

    // add up all individual entry rows to form categorized weight
    for (const row of entryRows) {
      payload.total_weight += row.weight
      payload.categorized_weight[row.category] =
        payload.categorized_weight[row.category] + row.weight
    }

    if (handleSubmitOverride) {
      handleSubmitOverride(payload)
    } else {
      setIsSubmitting(true)

      await SE_API.post(
        `/transfers/update/${collection.id}`,
        payload,
        user.accessToken
      )

      sessionStorage.removeItem(session_storage_key)
      setIsSubmitting(false)
      setOpenTransfer(null)
      refresh()
    }
  }

  function handleCloseCollection() {
    if (handleCloseCollectionOverride) {
      handleCloseCollectionOverride()
    } else {
      window.sessionStorage.removeItem(session_storage_key)
      setOpenTransfer(null)
    }
  }

  function verifyClose() {
    if (isChanged) {
      return window.confirm(
        'You have unsaved changes on this collection. Are you sure you want to exit?'
      )
    } else return true
  }

  const collectionContextValue = {
    collection,
    entryRows,
    setEntryRows,
    notes,
    setNotes,
    session_storage_key,
    isChanged,
    handleSubmit,
    isSubmitting,
    total,
    completedAt,
    setCompletedAt,
  }

  return (
    <CollectionContext.Provider value={collectionContextValue}>
      <CardOverlay
        isOpen={!!collection}
        closeHandler={handleCloseCollection}
        preCloseHandler={verifyClose}
        CardHeader={CollectionHeader}
        CardBody={CollectionBody}
        CardFooter={CollectionFooter}
      />
    </CollectionContext.Provider>
  )
}
