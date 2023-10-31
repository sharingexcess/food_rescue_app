import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  IconButton,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'

function WarehouseConfig({ onJacksChange, formData }) {
  const [jacks, setJacks] = useState([{ name: '', weight: '' }])

  useEffect(() => {
    console.log('formData:', formData)
    if (formData && formData.jacks && formData.jacks.length > 0) {
      setJacks(formData.jacks)
    }
  }, [formData])

  const handleJackChange = (index, field, value) => {
    const newJacks = [...jacks]
    newJacks[index][field] = value
    setJacks(newJacks)
    onJacksChange(newJacks)
  }

  const addNewJack = () => {
    setJacks([...jacks, { name: '', weight: '' }])
  }

  const removeJack = index => {
    const newJacks = jacks.filter((_, idx) => idx !== index)
    setJacks(newJacks)
    onJacksChange(newJacks) // Inform the parent component or backend about the change
  }

  return (
    <Box boxShadow="md" borderRadius="md">
      <Text fontSize="2xl" mb={4} fontWeight="bold">
        Warehouse Config
      </Text>
      <VStack spacing={4} align="stretch">
        {jacks.map((jack, index) => (
          <Box key={index} p={4} boxShadow="sm" borderRadius="lg">
            <HStack spacing={3} align="center">
              <Input
                placeholder="Jack Name"
                value={jack.name}
                onChange={e => handleJackChange(index, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Jack Weight"
                value={jack.weight}
                onChange={e =>
                  handleJackChange(index, 'weight', e.target.value)
                }
              />
              <IconButton
                icon={<CloseIcon />}
                onClick={() => removeJack(index)}
                aria-label="Remove jack"
                size="sm"
                colorScheme="red"
              />
            </HStack>
          </Box>
        ))}
        <Button onClick={addNewJack} colorScheme="blue">
          Add Jack
        </Button>
      </VStack>
    </Box>
  )
}

export default WarehouseConfig
