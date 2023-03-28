import { CloseIcon, DragHandleIcon } from '@chakra-ui/icons'
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { STATUSES } from 'helpers'
import { useApi } from 'hooks'
import { useParams } from 'react-router-dom'

export function Transfer({ transfer, removeTransfer }) {
  const { rescue_id } = useParams()
  const { data: rescue } = useApi(`/rescues/get/${rescue_id}`)

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
      {[STATUSES.SCHEDULED, STATUSES.ACTIVE].includes(transfer.status) ? (
        <IconButton
          variant="ghosted"
          icon={<DragHandleIcon color="element.tertiary" w="3" />}
        />
      ) : (
        <Box w="4" />
      )}
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
            {transfer.type}
          </Heading>
          {rescue?.status === STATUSES.SCHEDULED && (
            <IconButton
              variant="ghosted"
              h="auto"
              icon={<CloseIcon w="3" h="auto" color="element.tertiary" />}
              onClick={() => removeTransfer(transfer)}
            />
          )}
        </Flex>
        <Heading as="h3" size="md" fontWeight="600" color="element.primary">
          {transfer.organization.name}
        </Heading>
        <Text fontWeight="300" color="element.secondary">
          {transfer.location.nickname || transfer.location.address1}
        </Text>
      </Box>
    </Flex>
  )
}
