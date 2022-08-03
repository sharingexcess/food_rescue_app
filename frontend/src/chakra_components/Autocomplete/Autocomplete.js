import { ChevronDownIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Divider,
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
  ...props
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
    <Flex position="relative" {...props}>
      {label && <label>{label}</label>}
      <Input
        placeholder={placeholder}
        value={value ? value[displayField] : inputValue}
        disabled={!!value}
        onChange={e => setInputValue(e.target.value)}
        variant="flushed"
        fontSize="sm"
        color="element.primary"
        {...props}
      />
      {value && (
        <IconButton
          variant="tertiary"
          icon={<CloseIcon />}
          color="element.secondary"
          onClick={() => setValue()}
        />
      )}
      {options.length && inputValue.length ? (
        <Box
          position="absolute"
          top="12"
          bg="surface.card"
          w="100%"
          boxShadow="lg"
          zIndex="10"
          py="1"
          px="4"
          borderRadius="md"
        >
          <UnorderedList styleType="none" m="0">
            {options.slice(0, 10).map((option, i) => (
              <>
                <ListItem
                  fontSize="xs"
                  py={2}
                  key={i}
                  onClick={() => handleSelect(option)}
                  cursor="pointer"
                >
                  {option[displayField]}
                </ListItem>
                {i !== 9 && <Divider />}
              </>
            ))}
          </UnorderedList>
        </Box>
      ) : null}
    </Flex>
  )
}
