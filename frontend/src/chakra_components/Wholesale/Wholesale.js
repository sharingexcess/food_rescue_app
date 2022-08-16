import { CalendarIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { formatTimestamp, STATUSES } from 'helpers'
import { useApi, useIsMobile } from 'hooks'
import moment from 'moment'
import { useMemo, useState } from 'react'

export function Wholesale() {
  const [date, setDate] = useState(formatTimestamp(new Date(), 'YYYY-MM-DD'))
  const { data: rescues } = useApi(
    '/rescues',
    useMemo(() => ({ type: 'wholesale', date: date }), [date])
  )
  const isMobile = useIsMobile()

  function handleChangeDate(event) {
    const dateValue = event.target.value
      ? formatTimestamp(event.target.value, 'YYYY-MM-DD')
      : ''
    setDate(dateValue)
  }

  return (
    <Page
      id="Wholesale"
      title="Wholesale"
      breadcrumbs={[
        { label: 'Wholesale', link: '/wholesale' },
        { label: formatTimestamp(date, 'MMMM DD'), link: '/wholesale' },
      ]}
    >
      <Heading
        as="h1"
        fontWeight="700"
        size="2xl"
        textTransform="capitalize"
        color="element.primary"
        mb="8"
      >
        Wholesale
      </Heading>
      <Flex w="100%" justify="space-between" align="center" mb="4">
        <Heading size="md" flexBasis="50%">
          {formatTimestamp(date, 'dddd, MMM. DD')}
        </Heading>
        <InputGroup flexGrow="1" flexBasis="128px">
          <Input
            type="date"
            value={date}
            variant="flushed"
            onChange={e => handleChangeDate(e)}
            fontSize="sm"
            color="element.secondary"
          />
          <InputRightElement
            pointerEvents="none"
            children={<CalendarIcon mr="2" color="element.tertiary" />}
          />
        </InputGroup>
      </Flex>
      {rescues &&
        rescues.map((rescue, i) => (
          <>
            <WholesaleRescue rescue={rescue} />
            {i < rescues.length - 1 && <Divider />}
          </>
        ))}
      <Button
        size="lg"
        w={isMobile ? 'calc(100% - 32px)' : 'auto'}
        position={isMobile ? 'fixed' : 'relative'}
        mt="4"
        left={isMobile ? '4' : 'unset'}
        bottom={isMobile ? '4' : 'unset'}
      >
        Add Donation
      </Button>
    </Page>
  )
}

function WholesaleRescue({ rescue }) {
  const donation = rescue.stops[0]
  return (
    <Flex gap="6" justify="space-between" align="center" py="6">
      <Box
        w="4"
        h="4"
        borderRadius="xl"
        flexGrow="0"
        flexShrink="0"
        bg={
          rescue.status === STATUSES.COMPLETED
            ? 'se.brand.primary'
            : 'se.brand.white'
        }
        border="3px solid"
        borderColor={
          rescue.status === STATUSES.COMPLETED
            ? 'se.brand.primary'
            : 'blue.primary'
        }
      />
      <Box flexGrow="1">
        <Heading
          size="md"
          fontWeight="600"
          color={
            rescue.status === STATUSES.COMPLETED
              ? 'element.primary'
              : 'blue.primary'
          }
        >
          {donation.organization.name}
        </Heading>
        <Text fontSize="sm" color="element.tertiary" fontWeight="300">
          {donation.impact_data_total_weight} lbs.&nbsp;&nbsp;|&nbsp;&nbsp;
          {donation.notes}
        </Text>
      </Box>
      <IconButton
        variant="ghosted"
        icon={<ChevronRightIcon w="6" h="6" color="element.tertiary" />}
      />
    </Flex>
  )
}
