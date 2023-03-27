import { EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react'
import { useDistributionContext } from 'components'
import { STATUSES } from 'helpers'

export function NoteInput() {
  const { distribution, notes, setNotes } = useDistributionContext()

  return distribution.status === STATUSES.CANCELLED ? (
    <Flex align="center" my="4">
      <EditIcon mr="4" color="element.tertiary" />
      <Text fontSize="sm" color="element.secondary">
        {distribution.notes}
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
        placeholder="Add notes to this distribution..."
        readOnly={distribution.status === STATUSES.CANCELLED}
        onChange={e => setNotes(e.target.value)}
        mb="4"
      />
    </InputGroup>
  )
}
