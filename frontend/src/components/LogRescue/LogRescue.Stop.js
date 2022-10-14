import { CloseIcon, DragHandleIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { STATUSES } from 'helpers'

export function Stop({ stop, removeStop, setActiveStop }) {
  const isCompleted = stop.status === STATUSES.COMPLETED

  return (
    <Flex
      my="3"
      bg="surface.card"
      boxShadow="md"
      borderRadius="md"
      justify="flex-start"
      align="center"
      cursor="grab"
      _active={{ cursor: 'grabbing' }}
    >
      <IconButton
        variant="ghosted"
        icon={<DragHandleIcon color="element.tertiary" w="3" />}
      />
      <Box w="100%" pb="4" pt="3">
        <Flex justify={'space-between'} align="center" py="1">
          <Heading
            as="h6"
            fontWeight="600"
            letterSpacing={1}
            fontSize="sm"
            color="element.tertiary"
            textTransform="uppercase"
          >
            <Flex align="center">
              <Box
                w="2"
                h="2"
                borderRadius="xl"
                display="inline-block"
                mr="2"
                bg={isCompleted ? 'se.brand.primary' : 'surface.background'}
                border="2px solid"
                borderColor={
                  isCompleted ? 'se.brand.primary' : 'element.active'
                }
              />
              {isCompleted ? 'completed' : 'incomplete'} {stop.type}{' '}
              {stop.impact_data_total_weight &&
                `(${stop.impact_data_total_weight} lbs.)`}
            </Flex>
          </Heading>
          <IconButton
            variant="ghosted"
            icon={<CloseIcon w="3" color="element.tertiary" />}
            onClick={removeStop}
            height="unset"
            px="2"
          />
        </Flex>
        <Heading as="h3" size="md" fontWeight="600">
          {stop.organization.name}
        </Heading>
        <Text as="p" fontWeight="300" color="element.secondary">
          {stop.location.nickname || stop.location.address1}
        </Text>
        <Button
          size="sm"
          variant="tertiary"
          mt="1"
          p="0"
          onClick={() => setActiveStop(stop)}
          color={isCompleted ? 'element.success' : 'element.active'}
        >
          {isCompleted ? 'Edit Impact Data' : 'Add Impact Data'}
        </Button>
      </Box>
    </Flex>
  )
}
