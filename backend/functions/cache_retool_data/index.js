const moment = require('moment-timezone')
const { uploadFile } = require('../../helpers/functions')
const { analytics } = require('../api/analytics')
const { generateReport } = require('../api/reports')

exports.cache_retool_data = async () => {
  const date = moment(new Date()).format('yyyy-MM-DD')

  const cumulative_report = await analytics('2016-01-01', date, 'Food Category')
  console.log('Returned from calling analytics:', cumulative_report)

  const report_for_week = await generateReport(
    moment().startOf('week').subtract(1, 'week').format('YYYY-MM-DD'),
    moment().endOf('week').format('YYYY-MM-DD'),
    'day'
  )

  console.log('Reports for this week:', report_for_week)

  const report_for_month = await generateReport(
    moment().startOf('month').subtract(1, 'month').format('YYYY-MM-DD'),
    moment().endOf('month').format('YYYY-MM-DD'),
    'day'
  )

  console.log('Reports for this month:', report_for_month)

  const report_for_year = await generateReport(
    moment().startOf('year').subtract(1, 'years').format('YYYY-MM-DD'),
    moment().endOf('year').format('YYYY-MM-DD'),
    'month'
  )

  console.log('Report for this year:', report_for_year)

  const data = {
    stats: {
      total_weight: cumulative_report.total_weight,
      retail_value: cumulative_report.retail_value,
      emissions_reduced: cumulative_report.emissions_reduced,
    },
    reports: {
      week: report_for_week,
      month: report_for_month,
      year: report_for_year,
    },
  }
  console.log('Data being cached:', data)
  const jsonData = JSON.stringify(data)
  const path = `retoolCache/${date}.json`
  uploadFile(path, jsonData)
  console.log('done!')
}
