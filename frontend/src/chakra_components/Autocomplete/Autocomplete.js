import { ChevronDownIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  IconButton,
  Input,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  UnorderedList,
} from '@chakra-ui/react'

const { useEffect, useState } = require('react')

export function Autocomplete({
  label,
  placeholder,
  value,
  setValue,
  handleChange,
  displayField,
}) {
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState([])

  useEffect(() => {
    async function onChange() {
      const results = await handleChange(inputValue)
      console.log('results', results)

      setOptions(results)
    }
    if (inputValue) onChange()
  }, [inputValue, handleChange])

  function handleSelect(option) {
    setValue(option)
  }

  return (
    <Flex position="relative">
      {label && <label>{label}</label>}
      <Input
        placeholder={placeholder}
        value={value ? value[displayField] : inputValue}
        disabled={!!value}
        onChange={e => setInputValue(e.target.value)}
        variant="flushed"
      />
      {value && <IconButton icon={<CloseIcon />} onClick={() => setValue()} />}
      {options.length && inputValue.length ? (
        <Box
          position="absolute"
          top="12"
          bg="card-dark"
          w="100%"
          boxShadow="lg"
          zIndex="10"
          p="4"
          borderRadius="md"
        >
          <UnorderedList styleType="none">
            {options.map((option, i) => (
              <ListItem key={i} onClick={() => handleSelect(option)}>
                {option[displayField]}
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : null}
    </Flex>
  )
}
