import { DeleteIcon, CheckCircleIcon } from '@chakra-ui/icons'
import {
  Flex,
  Box,
  Heading,
  Text,
  IconButton,
  Badge,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { STATUSES, SE_API } from 'helpers'
import { Link } from 'react-router-dom'
import { useAuth } from 'hooks'

export function EntryCard({ rescue }) {
  const donation = rescue.transfers[0]

  const gradientText = useColorModeValue(
    'linear-gradient(90deg, blue 0%, green 100%)',
    'linear-gradient(90deg, lightblue 0%, lightgreen 100%)'
  )

  const toast = useToast()
  const { user } = useAuth()

  const handleDelete = async () => {
    const rescue_id = rescue.id
    const transfer_id = donation.id

    const cancel_transfer_payload = {
      notes: 'Cancelled by admin',
    }

    await SE_API.post(
      `/transfers/cancel/${transfer_id}`,
      cancel_transfer_payload,
      user.accessToken
    )

    await SE_API.post(
      `/rescues/cancel/${rescue_id}`,
      cancel_transfer_payload,
      user.accessToken
    )

    toast({
      title: 'Rescue cancelled.',
      description: 'The rescue has been cancelled.',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top',
    })
  }

  return (
    <Link to={`/wholesale-new/entry/create?edit=${rescue.id}`}>
      <Flex
        gap="4"
        justify="space-between"
        align="center"
        py="8"
        borderRadius="md"
        boxShadow="lg"
        p={6}
      >
        <Text fontSize="xl" fontWeight="bold"></Text>

        <Box flexGrow="1">
          <Flex align="center">
            <Heading
              size="md"
              fontWeight="600"
              color={
                rescue.status === STATUSES.COMPLETED
                  ? 'element.primary'
                  : 'element.active'
              }
              bgClip={rescue.status === STATUSES.COMPLETED ? 'text' : 'none'}
              backgroundImage={
                rescue.status === STATUSES.COMPLETED ? gradientText : 'none'
              }
            >
              {donation.organization.name}
            </Heading>
            {rescue.status === STATUSES.COMPLETED && (
              <Badge ml={2} colorScheme="green">
                Completed
              </Badge>
            )}
          </Flex>
          <Text fontSize="sm" color="element.tertiary" fontWeight="300" mt="1">
            {donation.product_type ? donation.product_type : 'N/A'}
            &nbsp;&nbsp;|&nbsp;&nbsp;
            {donation.total_weight} lbs.
          </Text>
          <Text
            fontSize="sm"
            color="element.primary"
            fontWeight="300"
            noOfLines={1}
            mt="1"
          >
            {/* TODO */}
            {/* {rescue.notes} */}
          </Text>
        </Box>

        <Box textAlign="center">
          <Text fontSize={12} mt="0">
            {donation.sorted ? 'Sorted' : ''}
          </Text>
          {donation.sorted ? (
            <CheckCircleIcon color="green.500" w="5" h="5" />
          ) : (
            <Box w="5" h="5" />
          )}
        </Box>

        <IconButton
          variant="ghosted"
          icon={<DeleteIcon w="6" h="6" color="#8000000" />}
          mr="4"
          mt={2}
          onClick={() => {
            handleDelete()
          }}
        />
      </Flex>
    </Link>
  )
}
