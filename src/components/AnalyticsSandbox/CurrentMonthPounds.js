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
import {
  formatLargeNumber,
  calculateCategoryRatios,
  FOOD_CATEGORIES,
  FOOD_RETAIL_VALUES,
  FOOD_FAIR_MARKET_VALUES,
  MONTHS,
  filterCompletedStopsByDateRange,
} from 'helpers'
import moment from 'moment'

export function CurrentMonthPounds() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [retailValue, setRetailValue] = useState(0)
  const [fairMarketValue, setFairMarketValue] = useState(0)
  const [totalMonthDeliveryPounds, setTotalMonthDeliveryPounds] = useState(0)
  const [categoryRatios, setCategoryRatios] = useState(0)
  const [monthOrYear, setMonthOrYear] = useState(true)
  const [currentYear, setCurrentYear] = useState(new Date().getYear() + 1900)

  const filterByCurrentMonth = useCallback(
    stop => {
      if (stop.status === 9 && stop.time_finished) {
        const date =
          stop.time_finished && stop.time_finished.toDate
            ? stop.time_finished.toDate() // handle firestore date objects
            : new Date(stop.time_finished) // handle date strings created manually
        console.log(date.getMonth(), date.getYear(), currentMonth, currentYear)
        return (
          date.getMonth() === currentMonth &&
          date.getYear() + 1900 === currentYear
        )
      } else return false
    },
    [currentMonth, currentYear]
  )

  const deliveries = useFirestore('deliveries', filterByCurrentMonth)

  const pickups = useFirestore('pickups', filterByCurrentMonth)

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
    for (const category of FOOD_CATEGORIES) {
      const categoryWeight = totalMonthDeliveryPounds * categoryRatios[category]
      const categoryRetailValue = categoryWeight * FOOD_RETAIL_VALUES[category]
      const categoryFairMarketValue =
        categoryWeight * FOOD_FAIR_MARKET_VALUES[category]
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
      name: MONTHS[currentMonth],
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
                {MONTHS.map((month, i) => (
                  <option value={i} key={month}>
                    {MONTHS[i]}
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
            Breakdown of pounds in {MONTHS[currentMonth]} 2021
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
