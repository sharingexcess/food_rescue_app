import { DeleteIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Text } from '@chakra-ui/react'
import { usePickupContext } from 'components'

export function EntryRows({ entryRows }) {
  const { setEntryRows, session_storage_key, notes } = usePickupContext()

  function removeEntryRow(index) {
    if (window.confirm('Are you sure you want to remove this row?')) {
      const filtered = [...entryRows]
      filtered.splice(index, 1)
      setEntryRows(filtered)
      session_storage_key &&
        sessionStorage.setItem(
          session_storage_key,
          JSON.stringify({
            sessionEntryRows: filtered,
            sessionNotes: notes,
          })
        )
    }
  }

  return (
    <>
      {entryRows.map((row, i) => (
        <Flex key={i} justify="flex-end" gap="2" py="2">
          <Text mr="auto" textTransform="capitalize">
            {row.category.replace('impact_data_', '').replace('_', ' ')}
          </Text>
          <Text px="4" color="se.brand.primary">
            {row.weight} lbs.
          </Text>
          <IconButton
            size="xs"
            variant="tertiary"
            icon={<DeleteIcon />}
            color="element.secondary"
            onClick={() => removeEntryRow(i)}
            ml="2"
          />
        </Flex>
      ))}
    </>
  )
}
