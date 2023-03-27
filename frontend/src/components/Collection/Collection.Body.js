import { Flex, Heading, Text } from '@chakra-ui/react'
import { useCollectionContext, useRescueContext } from 'components'
import { STATUSES } from 'helpers'
import { EntryRowInput } from './Collection.EntryRowInput'
import { EntryRows } from './Collection.EntryRows'

export function CollectionBody() {
  const { entryRows, collection } = useCollectionContext()
  const { rescue, activeTransfer } = useRescueContext()

  if (!collection) return null
  return (
    <Flex direction="column">
      {collection.status === STATUSES.CANCELLED ? (
        <Flex direction="column" align="center" w="100%" py="8">
          <Heading as="h4" size="md" color="element.primary" mb="2">
            This collection has been cancelled.
          </Heading>
        </Flex>
      ) : collection?.id === activeTransfer?.id ||
        collection.status === STATUSES.COMPLETED ? (
        <>
          <EntryRows entryRows={entryRows} />
          <EntryRowInput />
        </>
      ) : (
        <Flex direction="column" align="center" w="100%" py="8">
          <Heading as="h4" size="md" color="element.primary" mb="2">
            This collection isn't active yet.
          </Heading>
          <Text align="center" fontSize="sm" color="element.secondary">
            {rescue.status === STATUSES.ACTIVE
              ? 'You can enter data here once you complete all previous stops along your rescue.'
              : 'Ready to go? Start this rescue to begin entering data.'}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
