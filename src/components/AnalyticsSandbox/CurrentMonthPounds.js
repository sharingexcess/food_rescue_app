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
  const [totalDeliveryPounds, setTotalDeliveryPounds] = useState(0)
  const [categoryRatios, setCategoryRatios] = useState(0)
  const [monthOrYear, setMonthOrYear] = useState(true) // true - Monthly Pounds shown; false - Yearly Pounds shown
  const [currentYear, setCurrentYear] = useState(new Date().getYear() + 1900)
  const [years, setYears] = useState([])
  const [breakdownOfPounds, setBreakdownOfPounds] = useState([])
  const [
    forecastVsActualPerformance,
    setForecastVsActualPerformance,
  ] = useState([])

  const deliveries = useFirestore(
    'deliveries',
    useCallback(
      d => {
        if (d.status === 9) {
          const deliveryDate =
            d.time_finished && d.time_finished.toDate
              ? d.time_finished.toDate() // handle firestore date objects
              : d.time_finished
              ? new Date(d.time_finished) // handle date strings created manually
              : d.report.created_at.toDate() //handle deliveries without time_finished
          if (monthOrYear) {
            return (
              deliveryDate.getMonth() === currentMonth &&
              deliveryDate.getYear() + 1900 === currentYear
            )
          } else {
            return deliveryDate.getYear() + 1900 === currentYear
          }
        }
      },
      [currentMonth, monthOrYear, currentYear]
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
          if (monthOrYear) {
            return (
              pickupDate.getMonth() === currentMonth &&
              pickupDate.getYear() + 1900 === currentYear
            )
          } else {
            return pickupDate.getYear() + 1900 === currentYear
          }
        } else return false
      },
      [currentMonth, monthOrYear, currentYear]
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
      setTotalDeliveryPounds(
        generateTotalWeight(deliveries, 'weight', deliveries.length)
      )
    else {
      setTotalDeliveryPounds(0)
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
  }, [totalDeliveryPounds, categoryRatios])

  useEffect(() => {
    const tempBreakdownOfPounds = [
      {
        name: 'Warehosue Outgoing',
        value: deliveries.reduce(
          (total, d) =>
            d.direct_donation_id ? total + d.report.weight : total,
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
    ]
    setBreakdownOfPounds(tempBreakdownOfPounds)
  }, [deliveries])

  useEffect(() => {
    const tempforecastVsActualPerformance = [
      {
        name: monthOrYear ? months[currentMonth] : currentYear,
        actual: totalDeliveryPounds,
        forecast: 15000,
      },
    ]

    setForecastVsActualPerformance(tempforecastVsActualPerformance)
  }, [monthOrYear, currentMonth, currentYear, totalDeliveryPounds])

  useEffect(() => {
    const updatedYears = []
    for (let i = 2016; i <= new Date().getYear() + 1900; i++) {
      updatedYears.push(i)
    }
    setYears(updatedYears)
  }, [])

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <>
        <text
          fontFamily="Montserrat"
          fontSize="80%"
          key={index}
          x={x}
          y={y - 13}
          fill="black"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {formatLargeNumber(value)}
        </text>
        <text
          fontFamily="Montserrat"
          fontSize="80%"
          key={index + 1}
          x={x}
          y={y}
          fill={COLORS[index]}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {formatLargeNumber(percent * 100)} %
        </text>
      </>
    )
  }

  function BarChartTooltip({ active, payload, label }) {
    if (active && payload && label) {
      return (
        <div>
          <Text color="grey" type="small">
            Actual: {formatLargeNumber(payload[0]['payload']['actual'])}
          </Text>
          <Text color="green" type="small">
            Forecast: {formatLargeNumber(payload[0]['payload']['forecast'])}
          </Text>
        </div>
      )
    }
    return null
  }
  function monthChange(e) {
    setCurrentMonth(parseInt(e.target.value))
  }

  function monthOrYearChange() {
    if (monthOrYear) setMonthOrYear(false)
    else setMonthOrYear(true)
  }

  function yearChange(e) {
    setCurrentYear(years[parseInt(e.target.value)])
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
              </select>
              <select
                value={years.indexOf(currentYear)}
                onChange={yearChange}
                id="Year"
              >
                {years.map((year, i) => (
                  <option value={i} key={year}>
                    {years[i]}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <select style={{ marginTop: '3%' }} onChange={monthOrYearChange}>
                <option>Current Month Pounds</option>
                <option selected="selected">Current Year Pounds</option>
              </select>
              <select
                value={years.indexOf(currentYear)}
                onChange={yearChange}
                id="Year"
              >
                {years.map((year, i) => (
                  <option value={i} key={year}>
                    {years[i]}
                  </option>
                ))}
              </select>
            </>
          )}
          <Text
            id="CurrentMonthPoundsLabel"
            type="secondary-header"
            color="green"
            align="center"
          >
            {formatLargeNumber(totalDeliveryPounds)} lbs.
          </Text>
          <section>
            <Text type="small" color="green">
              {formatLargeNumber(totalDeliveryPounds * 3.66)} lbs.
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
          {monthOrYear ? (
            <Text type="graph-title" color="black" align="center">
              Breakdown of pounds in {months[currentMonth]} 2021
            </Text>
          ) : (
            <Text type="graph-title" color="black" align="center">
              Breakdown of pounds in {currentYear}{' '}
            </Text>
          )}
          <ResponsiveContainer width="100%" height={175}>
            <PieChart margin={{ bottom: 10, top: -10 }}>
              <Pie
                dataKey="value"
                data={breakdownOfPounds}
                outerRadius={40}
                isAnimationActive={false}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {breakdownOfPounds.map((entry, index) => (
                  <>
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  </>
                ))}
              </Pie>
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
                <Tooltip content={<BarChartTooltip />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>
    </main>
  )
}
