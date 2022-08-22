import { CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Divider,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react'
import { useEffect, useState, Fragment } from 'react'

export function Autocomplete({
  label,
  placeholder,
  value,
  setValue,
  handleChange,
  optionLabel,
  displayField,
  ...props
}) {
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState([])

  useEffect(() => {
    async function onChange() {
      const results = await handleChange(inputValue)
      setOptions(results)
    }
    if (inputValue) onChange()
  }, [inputValue, handleChange])

  function handleSelect(option) {
    setValue(option)
    setInputValue('')
  }

  return (
    <Flex id="Autocomplete" position="relative" direction="column" {...props}>
      {label && <label>{label}</label>}
      <InputGroup>
        <Input
          placeholder={placeholder}
          value={value ? value[displayField] : inputValue}
          disabled={!!value}
          onChange={e => setInputValue(e.target.value)}
          fontSize="sm"
          color="element.primary"
          _placeholder={{ color: 'element.secondary' }}
          {...props}
        />
        {value && (
          <InputRightElement>
            <IconButton
              variant="tertiary"
              icon={<CloseIcon w="3" color="element.tertiary" />}
              color="element.secondary"
              onClick={() => setValue()}
            />
          </InputRightElement>
        )}
      </InputGroup>
      {options.length && inputValue.length && !value ? (
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
              <Fragment key={i}>
                <ListItem
                  fontSize="xs"
                  py={2}
                  onClick={() => handleSelect(option)}
                  cursor="pointer"
                >
                  {optionLabel ? optionLabel(option) : option[displayField]}
                </ListItem>
                {i !== 9 && i !== options.length - 1 && <Divider />}
              </Fragment>
            ))}
          </UnorderedList>
        </Box>
      ) : null}
    </Flex>
  )
}
