import { EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react'
import { useCollectionContext } from 'components'
import { STATUSES } from 'helpers'

export function NoteInput() {
  const { collection, notes, session_storage_key, entryRows, setNotes } =
    useCollectionContext()

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

  return collection.status === STATUSES.CANCELLED ? (
    <Flex align="center" my="4">
      <EditIcon mr="4" color="element.tertiary" />
      <Text fontSize="sm" color="element.secondary">
        {collection.notes}
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
        placeholder="Add notes to this collection..."
        readOnly={collection.status === STATUSES.CANCELLED}
        onChange={e => handleNotesChange(e.target.value)}
        mb="4"
      />
    </InputGroup>
  )
}
