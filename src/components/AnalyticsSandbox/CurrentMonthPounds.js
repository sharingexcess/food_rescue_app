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
import { useCallback, useEffect, useState } from 'react'
import { useFirestore } from 'hooks'
import { formatLargeNumber, calculateCategoryRatios } from 'helpers'

const categories = [
  'bakery',
  'dairy',
  'meat/Fish',
  'mixed groceries',
  'non-perishable',
  'prepared/Frozen',
  'produce',
  'other',
]

const retailValues = {
  bakery: 2.36,
  dairy: 1.28,
  'meat/Fish': 4.4,
  'mixed groceries': 2.31,
  'non-perishable': 3.19,
  'prepared/Frozen': 4.13,
  produce: 1.57,
  other: 2.31,
}

const fairMarketValues = {
  bakery: 2.14,
  dairy: 1.42,
  'meat/Fish': 2.77,
  'mixed groceries': 1.62,
  'non-perishable': 2.13,
  'prepared/Frozen': 2.17,
  produce: 1.13,
  other: 1.62,
}

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
  const [retailValue, setRetailValue] = useState(0)
  const [fairMarketValue, setFairMarketValue] = useState(0)
  const [totalMonthDeliveryPounds, setTotalMonthDeliveryPounds] = useState(0)
  const [categoryRatios, setCategoryRatios] = useState(0)
  const [monthOrYear, setMonthOrYear] = useState(true)
  const [currentYear, setCurrentYear] = useState(new Date().getYear() + 1900)

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

  useEffect(() => {
    function generateTotalWeight(a, type, length) {
      if (length <= 0) return 0
      return (
        generateTotalWeight(a, type, length - 1) + a[length - 1].report[type]
      )
    }

    if (deliveries.length)
      setTotalMonthDeliveryPounds(
        generateTotalWeight(deliveries, 'weight', deliveries.length)
      )
    else {
      setTotalMonthDeliveryPounds(0)
    }
  }, [deliveries])

  useEffect(() => {
    if (pickups.length) setCategoryRatios(calculateCategoryRatios(pickups))
  }, [pickups])

  useEffect(() => {
    let totalRetail = 0
    let totalFairMarket = 0
    for (const category of categories) {
      const categoryWeight = totalMonthDeliveryPounds * categoryRatios[category]
      const categoryRetailValue = categoryWeight * retailValues[category]
      const categoryFairMarketValue =
        categoryWeight * fairMarketValues[category]
      totalRetail += categoryRetailValue
      totalFairMarket += categoryFairMarketValue
    }
    setRetailValue(totalRetail)
    setFairMarketValue(totalFairMarket)
  }, [totalMonthDeliveryPounds, categoryRatios])

  const forecast = 460000

  const breadkdownOfPounds = [
    {
      name: 'Warehosue Outgoing',
      value: deliveries.reduce(
        (total, d) => (d.direct_donation_id ? total + d.report.weight : total),
        0
      ),
    },
    {
      name: 'Food Rescue',
      value: deliveries.reduce(
        (total, d) => (d.route_id ? total + d.report.weight : total),
        0
      ),
    },
    {
      name: 'Direct Link',
      value: 0,
    },
  ]

  const forecastVsActualPerformance = [
    {
      name: months[currentMonth],
      actual: totalMonthDeliveryPounds,
      forecast: forecast,
    },
  ]

  const COLORS = ['#216810', '#9DA1A4', '#4EA528']

  const monthChange = e => {
    setCurrentMonth(parseInt(e.target.value))
  }

  const monthOrYearChange = e => {
    if (monthOrYear) setMonthOrYear(false)
    else setMonthOrYear(true)
  }

  console.log(currentYear)
  return (
    <main id="Revamp">
      <section id="CurrentMonthPounds">
        <section id="Content">
          {monthOrYear ? (
            <>
              <select style={{ marginTop: '3%' }} onChange={monthOrYearChange}>
                <option>Current Month Pounds</option>
                <option>Current Year Pounds</option>
              </select>
              <select value={currentMonth} onChange={monthChange} id="Month">
                {months.map((month, i) => (
                  <option value={i} key={month}>
                    {months[i]}
                  </option>
                ))}
              </select>{' '}
            </>
          ) : (
            <select style={{ marginTop: '3%' }} onChange={monthOrYearChange}>
              <option>Current Month Pounds</option>
              <option selected="selected">Current Year Pounds</option>
            </select>
          )}
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
              {formatLargeNumber(totalMonthDeliveryPounds * 3.66)} lbs.
            </Text>
            <Text type="small" color="black">
              Emissions Reduced in Pounds
            </Text>
          </section>
          <section>
            <Text type="small" color="green">
              ${formatLargeNumber(retailValue)}
            </Text>
            <Text type="small" color="black">
              Retail Value
            </Text>
          </section>
          <section>
            <Text type="small" color="green">
              ${formatLargeNumber(fairMarketValue)}
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
            <PieChart margin={{ bottom: 10, top: -10 }}>
              <Pie
                dataKey="value"
                isAnimationActive="true"
                data={breadkdownOfPounds}
                outerRadius={40}
                fill="#8884d8"
              >
                {breadkdownOfPounds.map((entry, index) => (
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
          <div id="BarChart">
            <Text type="graph-title" color="black" align="center">
              Forecast versus Actual Performance
            </Text>
            <ResponsiveContainer width="90%" height={100}>
              <BarChart layout="vertical" data={forecastVsActualPerformance}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={76} />
                <Bar dataKey="actual" barSize={15} fill="#9DA1A4" />
                <Bar dataKey="forecast" barSize={15} fill="#4EA528" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>
    </main>
  )
}
