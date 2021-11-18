import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
} from 'recharts'
import { Text } from '@sharingexcess/designsystem'
import { useCallback, useState } from 'react'
import { useFirestore } from 'hooks'
import { formatLargeNumber } from 'helpers'

export function CurrentMonthPounds() {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())

  const deliveries = useFirestore(
    'deliveries',
    useCallback(
      d => {
        if (d.status === 9) {
          const deliveryDate =
            d.time_finished && d.time_finished.toDate
              ? d.time_finished.toDate() // handle firestore date objects
              : new Date(d.time_finished) // handle date strings created manually
          return deliveryDate.getMonth() === currentMonth
        } else return false
      },
      [currentMonth]
    )
  )

  const pickups = useFirestore(
    'pickups',
    useCallback(
      p => {
        if (p.status === 9) {
          const pickupDate =
            p.time_finished && p.time_finished.toDate
              ? p.time_finished.toDate() // handle firestore date objects
              : new Date(p.time_finished) // handle date strings created manually
          return pickupDate.getMonth() === currentMonth
        } else return false
      },
      [currentMonth]
    )
  )

  function findTotalWeight(a, type, i) {
    if (i <= 0) return 0
    return findTotalWeight(a, type, i - 1) + a[i - 1].report[type]
  }

  // (total, currentDelivery) => total + currentDelivery.report.weight,
  //   0
  // )
  const totalMonthDeliveryPounds = findTotalWeight(
    deliveries,
    'weight',
    deliveries.length
  )

  // pickups.reduce((total, p) => total + p.report.weight, 0)
  const totalMonthPickupPounds = findTotalWeight(
    pickups,
    'weight',
    pickups.length
  )

  const bakeryWeightPercentage =
    findTotalWeight(pickups, 'bakery', pickups.length) / totalMonthPickupPounds

  const dairyWeightPercentage =
    findTotalWeight(pickups, 'dairy', pickups.length) / totalMonthPickupPounds

  const meatWeightPercentage =
    findTotalWeight(pickups, 'meat/Fish', pickups.length) /
    totalMonthPickupPounds

  const mixedGroceriesWeightPercentage =
    findTotalWeight(pickups, 'mixed Groceries', pickups.length) /
    totalMonthPickupPounds

  const nonPerishablesWeightPercentage =
    findTotalWeight(pickups, 'non-perishable', pickups.length) /
    totalMonthPickupPounds

  const preparedsWeightPercentage =
    findTotalWeight(pickups, 'prepared/Frozen', pickups.length) /
    totalMonthPickupPounds

  // pickups.reduce((total, p) => total + p.report.produce, 0)
  const produceWeightPercentage =
    findTotalWeight(pickups, 'produce', pickups.length) / totalMonthPickupPounds

  const otherPerishablesWeightPercentage =
    findTotalWeight(pickups, 'other', pickups.length) / totalMonthPickupPounds

  const emissionsReduced = 3.66 * totalMonthDeliveryPounds
  const retailValue = 1000000
  const fairMarketValue = 1000000
  const forecast = 460000
  console.log(pickups[0])

  const piedata = [
    { name: 'Warehosue Outgoing', value: 0 },
    {
      name: 'Food Rescue',
      value: deliveries.reduce(
        (total, d) => (d.route_id ? total + d.report.weight : total),
        0
      ),
    },
    {
      name: 'Direct Link',
      value: deliveries.reduce(
        (total, d) => (d.direct_donation_id ? total + d.report.weight : total),
        0
      ),
    },
  ]

  const bardata = [
    {
      name: months[currentMonth],
      actual: totalMonthDeliveryPounds,
      forecast: forecast,
    },
  ]

  const COLORS = ['#216810', '#9DA1A4', '#4EA528']

  const onChange = e => {
    setCurrentMonth(parseInt(e.target.value))
  }

  return (
    <main id="Revamp">
      <section id="CurrentMonthPounds">
        <section id="Content">
          <select style={{ marginTop: '3%' }}>
            <option>Current Month Pounds</option>
            <option>Current Year Pounds</option>
          </select>
          <select value={currentMonth} onChange={onChange} id="Month">
            {months.map((month, i) => (
              <option value={i} key={month}>
                {months[i]}
              </option>
            ))}
          </select>
          <Text
            id="CurrentMonthPoundsLabel"
            type="secondary-header"
            color="green"
            align="center"
          >
            {formatLargeNumber(totalMonthDeliveryPounds)} lbs.
          </Text>
          <section>
            <Text type="small" color="green">
              {formatLargeNumber(emissionsReduced)}
            </Text>
            <Text type="small" color="black">
              Emissions Reduced in Pounds
            </Text>
          </section>
          <section>
            <Text type="small" color="green">
              ${retailValue}
            </Text>
            <Text type="small" color="black">
              Retail Value
            </Text>
          </section>
          <section>
            <Text type="small" color="green">
              ${fairMarketValue}
            </Text>
            <Text type="small" color="black">
              Fair Market Value
            </Text>
          </section>
        </section>

        <section
          id="Content"
          style={{
            background: '#E6E8EA',
            padding: '2%',
          }}
        >
          <Text type="graph-title" color="black" align="center">
            Breakdown of pounds in {months[currentMonth]} 2021
          </Text>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart margin={{ top: 10, right: 5, bottom: 10, left: 5 }}>
              <Pie
                dataKey="value"
                isAnimationActive="true"
                data={piedata}
                outerRadius={40}
                fill="#8884d8"
              >
                {piedata.map((entry, index) => (
                  <>
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  </>
                ))}
              </Pie>
              <Tooltip />
              <Legend align="center" iconType="circle" iconSize="12" />
            </PieChart>
          </ResponsiveContainer>

          <Text type="graph-title" color="black" align="center">
            Forecast versus Actual Performance
          </Text>
          <ResponsiveContainer width="90%" height={60}>
            <BarChart layout="vertical" data={bardata}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" scale="band" />
              <Bar dataKey="actual" barSize={15} fill="#9DA1A4" />
              <Bar dataKey="forecast" barSize={15} fill="#4EA528" />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </section>
    </main>
  )
}
