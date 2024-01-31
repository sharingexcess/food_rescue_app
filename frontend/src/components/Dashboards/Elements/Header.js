import { Box, Flex, Text, Select, Heading } from '@chakra-ui/react'
import {
  getDefaultRangeStart,
  getDefaultRangeEnd,
} from '../../Analytics/Analytics.utils'
import { useState } from 'react'
import DatePicker from 'react-datepicker'

export function Header({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  currOrg,
}) {
  const [dateRangeOption, setDateRangeOption] = useState('1 month')

  return (
    <>
      <Box
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        mb={10}
      >
        <Box display="flex" justifyContent="center">
          <Heading textAlign="center">
            {currOrg ? currOrg.name + ' Impact' : 'Loading..'}
          </Heading>
        </Box>
        <Select
          value={dateRangeOption}
          width={260}
          mt="4"
          onChange={e => {
            const value = e.target.value
            setDateRangeOption(value)
            const currentDate = new Date()
            switch (value) {
              case '1 month':
                setStartDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                )
                setEndDate(new Date())
                break
              case '3 months':
                setStartDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 3))
                )
                setEndDate(new Date())
                break
              case '6 months':
                setStartDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 6))
                )
                setEndDate(new Date())
                break
              case '1 year':
                setStartDate(
                  new Date(
                    currentDate.setFullYear(currentDate.getFullYear() - 1)
                  )
                )
                setEndDate(new Date())
                break
              case 'custom':
                setStartDate(new Date(getDefaultRangeStart()))
                setEndDate(new Date(getDefaultRangeEnd()))
                break
              default:
                break
            }
          }}
        >
          <option value="1 month">Last month</option>
          <option value="3 months">Last 3 months</option>
          <option value="6 months">Last 6 months</option>
          <option value="1 year">Last year</option>
          <option value="custom">Choose Date</option>
        </Select>
      </Box>

      {dateRangeOption === 'custom' && (
        <Flex gap="16" justify="space-between" mb="4">
          <Box>
            <Text fontWeight="600" color="element.tertiary">
              From
            </Text>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
          </Box>
          <Box>
            <Text fontWeight="600" color="element.tertiary">
              To
            </Text>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />
          </Box>
        </Flex>
      )}
    </>
  )
}
