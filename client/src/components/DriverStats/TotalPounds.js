import { Text } from '@sharingexcess/designsystem'
import { Loading } from 'components'
import { useFirestore } from 'hooks'
import React, { useMemo } from 'react'

export function TotalPounds({ stops }) {
  const { loadedAllData } = useFirestore()
  const driver_total_weight = useMemo(
    () => stops.reduce((a, b) => a + (b.impact_data_total_weight || 0), 0),
    [stops]
  )

  return driver_total_weight && loadedAllData ? (
    <section id="TotalPounds">
      <Text type="primary-header" align="center" color="white" shadow>
        {driver_total_weight.toLocaleString()} lbs.
      </Text>
      <Text type="subheader" align="center" color="white" shadow>
        Food diverted from landfills <br />
        and redistributed to your local community !!!
      </Text>
    </section>
  ) : (
    <Loading relative text="Calculating your impact" />
  )
}
