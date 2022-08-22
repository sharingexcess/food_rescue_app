import { EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react'
import { useRescueContext, useDeliveryContext } from 'components'
import { STATUSES } from 'helpers'

export function NoteInput() {
  const { openStop } = useRescueContext()
  const { notes, setNotes } = useDeliveryContext()

  return openStop.status === STATUSES.CANCELLED ? (
    <Flex align="center" my="4">
      <EditIcon mr="4" color="element.tertiary" />
      <Text fontSize="sm" color="element.secondary">
        {openStop.notes}
      </Text>
    </Flex>
  ) : (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <EditIcon mb="3" color="element.tertiary" />
      </InputLeftElement>
      <Input
        size="sm"
        color="element.secondary"
        value={notes || ''}
        placeholder="Add notes to this delivery..."
        readOnly={openStop.status === STATUSES.CANCELLED}
        onChange={e => setNotes(e.target.value)}
        mb="4"
      />
    </InputGroup>
  )
}
