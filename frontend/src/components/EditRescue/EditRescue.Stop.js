import { CloseIcon, DragHandleIcon } from '@chakra-ui/icons'
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { SE_API, STATUSES } from 'helpers'
import { useApi, useAuth } from 'hooks'
import { useParams } from 'react-router-dom'

export function Stop({ stop }) {
  const { rescue_id } = useParams()
  const { user } = useAuth()
  const { data: rescue, refresh } = useApi(`/rescues/${rescue_id}`)

  async function handleCancel() {
    await SE_API.post(
      `/rescues/${rescue_id}/${stop.type}/${stop.id}/cancel`,
      {
        status: STATUSES.SCHEDULED,
        is_deleted: true,
      },
      user.accessToken
    )
    refresh()
  }

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
      {[STATUSES.SCHEDULED, STATUSES.ACTIVE].includes(stop.status) ? (
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
            {stop.type}
          </Heading>
          {rescue?.status === STATUSES.SCHEDULED && (
            <IconButton
              variant="ghosted"
              h="auto"
              icon={<CloseIcon w="3" h="auto" color="element.tertiary" />}
              onClick={handleCancel}
            />
          )}
        </Flex>
        <Heading as="h3" size="md" fontWeight="600" color="element.primary">
          {stop.organization.name}
        </Heading>
        <Text fontWeight="300" color="element.secondary">
          {stop.location.nickname || stop.location.address1}
        </Text>
      </Box>
    </Flex>
  )
}
