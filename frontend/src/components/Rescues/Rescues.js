import React, { useEffect, useMemo, useState } from 'react'
import { useApi, useAuth, useFirestore } from 'hooks'
import { Ellipsis, Input, Loading, Error } from 'components'
import { API_ENDPOINTS, STATUSES } from 'helpers'
import { sortRescues, RescueCard } from './utils'
import { Emoji } from 'react-apple-emojis'
import {
  Button,
  FlexContainer,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'
import moment from 'moment'
import PullToRefresh from 'react-simple-pull-to-refresh'

export function Rescues() {
  const { user, admin } = useAuth()
  const handlers = useFirestore('users')
  const url_params = new URLSearchParams(window.location.search)

  // initialize state object to manage URL params, and user input filters
  const [state, setState] = useState({
    status: url_params.get('status') || STATUSES.SCHEDULED,
    handler_id: admin ? url_params.get('handler_id') || '' : user.id, // ensure that non-admins can't fetch data by transforming the url
    date: url_params.get('date') || '',
    limit: 10,
    handler_name: admin ? url_params.get('handler_name') || '' : user.name,
    handler_suggestions: null,
    scroll_position: null,
    status: 'scheduled',
  })

  // create memoized object of params to pass to API
  // only tracking which fields will be a part of the request
  // to prevent unnecessary fetches
  const api_params = useMemo(
    () => ({
      status: state.status === 'available' ? 'scheduled' : state.status,
      handler_id: state.status === 'available' ? 'null' : state.handler_id, // this is a weird edge case, yes we in fact need to use the string "null" here.
      date: state.date,
      limit: state.limit,
    }),
    [state.status, state.handler_id, state.date, state.limit]
  )

  // fetch data from API, renaming "data" as "rescues",
  // with a boolean value for loading state, and a callback
  // to load addtional rescues
  const {
    data: rescues,
    loading,
    loadMore,
    refresh,
    error,
  } = useApi(API_ENDPOINTS.RESCUES, api_params)

  // this useEfect updates the current URL on state changes
  // to preserve the current query over refresh/back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('status', state.status)
    params.set('handler_id', state.handler_id)
    params.set('date', state.date)
    params.set('handler_name', state.handler_name)
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [state])

  // this useEffect returns to the pre-update scroll position
  // when new rescues are loaded so users don't lose their place
  useEffect(() => {
    if (!loading && state.scroll_position) {
      window.scrollTo(0, state.scroll_position)
      setState({ ...state, scroll_position: null })
    }
  }, [loading, state])

  function handleLoadMore() {
    // store the current scroll position to return to after loading new rescues
    setState({ ...state, scroll_position: window.scrollY })
    loadMore()
  }

  function handleChangeHandler(event) {
    const search_value = event.target.value
    const suggestions = handlers.filter(i =>
      i.name.toLowerCase().includes(search_value.toLowerCase())
    )
    setState({
      ...state,
      handler_name: search_value,
      handler_suggestions: suggestions,
    })
  }

  function handleChangeDate(event) {
    const date = event.target.value
      ? moment(event.target.value).format('YYYY-MM-DD')
      : ''
    setState({ ...state, date })
  }

  function handleSelectHandler(selected) {
    setState({
      ...state,
      handler_id: selected.id,
      handler_name: selected.name,
      handler_suggestions: null,
    })
  }

  function handleClearHandler() {
    setState({
      ...state,
      handler_name: '',
      handler_id: '',
      handler_suggestions: null,
    })
  }

  function handleRefresh() {
    return new Promise(res => {
      refresh().then(res())
    })
  }

  const TabButtons = () => {
    return (
      <FlexContainer id="Rescues-tabs" primaryAlign="left">
        <Button
          key="available"
          size="small"
          color={state.status === 'available' ? 'blue' : 'white'}
          handler={() => setState({ ...state, status: 'available' })}
        >
          Available
        </Button>
        {[
          STATUSES.SCHEDULED,
          STATUSES.ACTIVE,
          STATUSES.COMPLETED,
          STATUSES.CANCELLED,
        ].map(status => (
          <Button
            key={status}
            size="small"
            color={state.status === status ? 'blue' : 'white'}
            handler={() => setState({ ...state, status: status })}
          >
            {status}
          </Button>
        ))}
      </FlexContainer>
    )
  }

  return (
    <main id="Rescues">
      <PullToRefresh onRefresh={handleRefresh}>
        <TabButtons />
        <FlexContainer
          id="Rescues-filters"
          primaryAlign="space-between"
          secondaryAlign="start"
        >
          <FlexContainer direction="vertical" textAlign="left">
            <Input
              element_id="Rescues-filter-handler"
              type="text"
              label="Handler..."
              value={state.handler_name}
              onChange={handleChangeHandler}
              suggestions={state.handler_suggestions}
              readOnly={!admin}
              onSuggestionClick={(_e, handler) => handleSelectHandler(handler)}
              clear={handleClearHandler}
            />
          </FlexContainer>
          <Input
            element_id="Rescues-filter-date"
            type="date"
            label="Date..."
            value={state.date}
            onChange={handleChangeDate}
          />
        </FlexContainer>
        {error ? (
          <Error message={error} />
        ) : !rescues || (!rescues.length && loading) ? (
          <>
            <Spacer height={64} />
            <Loading text="Loading rescues" relative />
          </>
        ) : !rescues.length ? (
          <div className="no-rescues">
            <Emoji className="icon" name="woman-shrugging" />
            <Spacer height={16} />
            <Text type="secondary-header" color="white" shadow align="center">
              No rescues found!
            </Text>
            <Spacer height={4} />
            <Text color="white" shadow align="center">
              Your search didn't return any results.
            </Text>
          </div>
        ) : (
          sortRescues(rescues, state.status).map(r => (
            <RescueCard key={r.id} r={r} />
          ))
        )}
        <Spacer height={32} />
        <FlexContainer primaryAlign="space-around">
          <Button handler={handleLoadMore} disabled={loading || !loadMore}>
            Load{loading ? 'ing' : !loadMore ? 'ed All' : ' More'} Rescues
            {loading && <Ellipsis />}
          </Button>
        </FlexContainer>
      </PullToRefresh>
    </main>
  )
}
