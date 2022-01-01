import { Text } from '@sharingexcess/designsystem'
import { Loading } from 'components'
import { formatLargeNumber, formatTimestamp } from 'helpers'
import { useFirestore, useIsMobile } from 'hooks'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export function PoundsByMonthChart({ stops }) {
  const [poundsByMonth, setPoundsByMonth] = useState()
  const { loadedAllData } = useFirestore()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (stops) {
      const poundsByMonth = []
      for (let i = 11; i >= 0; i--) {
        const range_start = moment()
          .subtract(i, 'months')
          .startOf('month')
          .toDate()
        const range_end = moment()
          .subtract(i - 1, 'months')
          .startOf('month')
          .toDate()
        const filterByDateRange = i =>
          i.timestamp_logged_finish.toDate() > range_start &&
          i.timestamp_logged_finish.toDate() < range_end
        const stopsInMonth = stops.filter(filterByDateRange)
        const totalWeightInStops = stopsInMonth.reduce(
          (a, b) => a + (b.impact_data_total_weight || 0),
          0
        )
        poundsByMonth.push({
          name: formatTimestamp(range_start, 'MMM'),
          date: range_start,
          weight: totalWeightInStops,
        })
      }
      setPoundsByMonth(poundsByMonth)
    }
  }, [stops])

  return poundsByMonth && loadedAllData ? (
    <section id="PoundsByMonthChart">
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 500}>
        <BarChart data={poundsByMonth}>
          <Bar dataKey="weight" fill="#E2CF45" radius={[4, 4, 0, 0]} />
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" tickFormatter={num => formatLargeNumber(num)} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff44' }} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  ) : (
    <Loading text="Calculating your impact" relative />
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="DriverStats-tooltip">
        <Text type="paragraph" align="center" color="green">
          {formatTimestamp(data.date, 'MMMM YYYY')}
        </Text>
        <Text type="small" align="center">
          {data.weight.toLocaleString()} lbs. rescued
        </Text>
      </div>
    )
  }

  return null
}
