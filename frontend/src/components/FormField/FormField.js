import { CheckIcon } from '@chakra-ui/icons'
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react'

export function FormField({
  formData,
  setFormData,
  title,
  id,
  isValid,
  isOptional,
}) {
  return (
    <Box w="100%" className="FormField" id={id}>
      <Text
        color="element.tertiary"
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
      >
        {title}
        {isOptional && (
          <Text
            as="span"
            fontWeight="300"
            fontSize="10px"
            pb="1"
            ml="2"
            color="element.tertiary"
          >
            (optional)
          </Text>
        )}
      </Text>
      <InputGroup>
        <Input
          type="text"
          value={formData[id]}
          onChange={e => setFormData({ ...formData, [id]: e.target.value })}
          isInvalid={!isValid}
          mb="8"
        />
        {isValid && formData[id].length && (
          <InputRightElement>
            <CheckIcon color="se.brand.primary" />
          </InputRightElement>
        )}
      </InputGroup>
    </Box>
  )
}
