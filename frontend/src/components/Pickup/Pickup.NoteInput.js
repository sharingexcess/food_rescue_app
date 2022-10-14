import { EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react'
import { usePickupContext } from 'components'
import { STATUSES } from 'helpers'

export function NoteInput() {
  const { pickup, notes, session_storage_key, entryRows, setNotes } =
    usePickupContext()

  function handleNotesChange(value) {
    setNotes(value)
    session_storage_key &&
      sessionStorage.setItem(
        session_storage_key,
        JSON.stringify({
          sessionEntryRows: entryRows,
          sessionNotes: value,
        })
      )
  }

  return pickup.status === STATUSES.CANCELLED ? (
    <Flex align="center" my="4">
      <EditIcon mr="4" color="element.tertiary" />
      <Text fontSize="sm" color="element.secondary">
        {pickup.notes}
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
        placeholder="Add notes to this pickup..."
        readOnly={pickup.status === STATUSES.CANCELLED}
        onChange={e => handleNotesChange(e.target.value)}
        mb="4"
      />
    </InputGroup>
  )
}
