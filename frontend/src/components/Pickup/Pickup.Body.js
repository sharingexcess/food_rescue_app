import { Flex, Heading, Text } from '@chakra-ui/react'
import { usePickupContext, useRescueContext } from 'components'
import { STATUSES } from 'helpers'
import { EntryRowInput } from './Pickup.EntryRowInput'
import { EntryRows } from './Pickup.EntryRows'

export function PickupBody() {
  const { entryRows } = usePickupContext()
  const { openStop, rescue } = useRescueContext()

  return (
    <Flex direction="column">
      {openStop.status === STATUSES.SCHEDULED ? (
        <Flex direction="column" align="center" w="100%" py="8">
          <Heading as="h4" size="md" color="element.primary" mb="2">
            This pickup isn't active yet.
          </Heading>
          <Text align="center" fontSize="sm" color="element.secondary">
            {rescue.status === STATUSES.ACTIVE
              ? 'You can enter data here once you complete all previous stops along your rescue.'
              : 'Ready to go? Start this rescue to begin entering data.'}
          </Text>
        </Flex>
      ) : openStop.status === STATUSES.CANCELLED ? (
        <Flex direction="column" align="center" w="100%" py="8">
          <Heading as="h4" size="md" color="element.primary" mb="2">
            This pickup has been cancelled.
          </Heading>
        </Flex>
      ) : (
        <>
          <EntryRows entryRows={entryRows} />
          <EntryRowInput />
        </>
      )}
    </Flex>
  )
}
