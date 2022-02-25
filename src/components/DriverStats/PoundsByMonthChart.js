import { Text } from '@sharingexcess/designsystem'
import { shortenLargeNumber } from 'helpers'
import { useIsMobile } from 'hooks'
import React from 'react'
import {
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export function PoundsByMonthChart({ poundsByMonth }) {
  const isMobile = useIsMobile()
  return (
    <section id="PoundsByMonthChart">
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 500}>
        <BarChart data={poundsByMonth}>
          <Bar dataKey="weight" fill="#E2CF45" radius={[4, 4, 0, 0]} />
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" tickFormatter={num => shortenLargeNumber(num)} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff44' }} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="DriverStats-tooltip">
        <Text type="paragraph" align="center" color="green">
          {data.date}
        </Text>
        <Text type="small" align="center">
          {data.weight.toLocaleString()} lbs. rescued
        </Text>
      </div>
    )
  }

  return null
}
