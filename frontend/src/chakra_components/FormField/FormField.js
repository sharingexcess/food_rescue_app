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
      <Text fontSize="sm" fontWeight="500" color="element.secondary">
        {title}
        {isOptional && (
          <Text
            as="span"
            verticalAlign="5%"
            fontWeight="300"
            fontSize="xs"
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
          <InputRightElement
            children={<CheckIcon color="se.brand.primary" />}
          />
        )}
      </InputGroup>
    </Box>
  )
}
