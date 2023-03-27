import { CalendarIcon } from '@chakra-ui/icons'
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react'
import { Autocomplete } from 'components/Autocomplete/Autocomplete'
import { formatTimestamp } from 'helpers'
import { useApi } from 'hooks'

export function Filters({
  handler,
  setHandler,
  date,
  setDate,
  status,
  setStatus,
  type,
  setType,
}) {
  const { data: handlers } = useApi('/public_profiles/list')

  function searchForHandler(value) {
    return (
      handlers &&
      handlers.filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
    )
  }

  function handleChangeDate(event) {
    const dateValue = event.target.value
      ? formatTimestamp(event.target.value, 'YYYY-MM-DD')
      : ''
    setDate(dateValue)
  }

  return (
    <Flex
      justify="space-between"
      id="RescuesHeaderBox"
      flexWrap={['wrap', 'wrap', 'nowrap', 'nowrap', 'nowrap']}
      gap="4"
    >
      <Select
        onChange={e => setStatus(e.target.value)}
        value={status}
        // flexBasis={['128px', '128px', '180px', '180px', '180px']}
        flexBasis="128px"
        flexGrow={1}
      >
        <option value="available">Available</option>
        <option value="scheduled">Scheduled</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      <Select
        onChange={e => setType(e.target.value)}
        value={type}
        // flexBasis={['128px', '128px', '180px', '180px', '180px']}
        flexBasis="128px"
        flexGrow={1}
      >
        <option value="retail">Retail</option>
        <option value="direct-link">Direct Link</option>
        {/* <option value="wholesale">Wholesale</option> */}
      </Select>
      <Autocomplete
        placeholder="Handler..."
        value={handler}
        setValue={setHandler}
        handleChange={value => searchForHandler(value)}
        displayField="name"
        id="Autocomplete"
        flexGrow="1"
        flexBasis="128px"
        optionLabel={i => `${i.name} (${i.email})`}
      />
      <InputGroup flexGrow="1" flexBasis="128px">
        <InputLeftElement pointerEvents="none">
          <CalendarIcon mr="2" color="element.tertiary" />
        </InputLeftElement>
        <Input
          type="date"
          value={date}
          onChange={e => handleChangeDate(e)}
          id="Datepicker"
          fontSize="sm"
          color="element.secondary"
        />
      </InputGroup>
    </Flex>
  )
}
