import { Spacer, Text } from '@sharingexcess/designsystem'
import { formatLargeNumber } from 'helpers'
import { useApi, useAuth } from 'hooks'
import React, { useEffect, useMemo, useState } from 'react'
import { PoundsByMonthChart } from './PoundsByMonthChart'
import { PoundsByOrgChart } from './PoundsByOrgChart'
import { useNavigate } from 'react-router-dom'
import { Loading } from 'components'

export function Impact() {
  const navigate = useNavigate()
  const { user } = useAuth()
  // const [working, setWorking] = useState(true)
  // const [apiData, setApiData] = useState()

  const {
    data: apiData,
    loading,
    error,
  } = useApi(
    '/impact',
    useMemo(
      () => ({
        user_id: user.id,
      }),
      [user.id]
    )
  )

  return (
    <main id="Impact">
      <Text type="section-header" color="white" shadow>
        You and Sharing Excess
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        Let's take a look at all the impact you've made rescuing and
        redistributing food.
      </Text>
      <Spacer height={32} />
      {apiData ? (
        <>
          <Text type="primary-header" align="center" color="white" shadow>
            {formatLargeNumber(apiData.total_weight)} lbs.
          </Text>
          <Text type="paragraph" align="center" color="white" shadow>
            Food diverted from landfills <br />
            and redistributed to your local community !!!
          </Text>
        </>
      ) : (
        <Loading relative text="Calculating your impact" />
      )}
      <Spacer height={64} />
      <Text type="section-header" color="white" shadow>
        Looking back on the year:
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        Here's a breakdown of all the food you've rescued in the last 12 months.
      </Text>
      <Spacer height={16} />
      {apiData ? (
        <PoundsByMonthChart poundsByMonth={apiData.poundsByMonth} />
      ) : (
        <Loading text="Calculating your impact" relative />
      )}
      <Spacer height={64} />
      <Text type="section-header" color="white" shadow>
        Where You Like to Rescue:
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        Click on a block to see exactly how much food you rescued from each
        organization.
      </Text>
      <Spacer height={16} />
      {apiData ? (
        <PoundsByOrgChart poundsByOrg={apiData.donors} />
      ) : (
        <Loading text="Calculating your impact" relative />
      )}
      <Spacer height={64} />
      <Text type="section-header" color="white" shadow>
        Where You Like to Deliver:
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        Click on a block to see exactly how much food you delivered to each
        organization.
      </Text>{' '}
      <Spacer height={16} />
      {apiData ? (
        <PoundsByOrgChart poundsByOrg={apiData.recipients} />
      ) : (
        <Loading text="Calculating your impact" relative />
      )}
    </main>
  )
}
