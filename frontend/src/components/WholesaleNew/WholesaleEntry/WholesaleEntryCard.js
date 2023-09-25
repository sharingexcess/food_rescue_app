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
import { STATUSES } from 'helpers'
import moment from 'moment'
import { Link } from 'react-router-dom'

export function EntryCard({ rescue }) {
  const donation = rescue.transfers[0]

  const gradientText = useColorModeValue(
    'linear-gradient(90deg, blue 0%, green 100%)',
    'linear-gradient(90deg, lightblue 0%, lightgreen 100%)'
  )

  const toast = useToast()

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
            {donation.total_weight} lbs.&nbsp;&nbsp;|&nbsp;&nbsp;
            {moment(donation.timestamp_completed).format('h:mma')}
          </Text>
          <Text
            fontSize="sm"
            color="element.primary"
            fontWeight="300"
            noOfLines={1}
            mt="1"
          >
            {rescue.notes}
          </Text>
        </Box>

        <Box textAlign="center">
          <Text fontSize={12} mt="2">
            Sorted
          </Text>
          {donation.sorted ? (
            <CheckCircleIcon color="green.500" w="5" h="5" />
          ) : (
            <Box w="5" h="5" /> // Empty space for non-sorted
          )}
        </Box>

        {/* Delete Icon Button */}
        <IconButton
          variant="ghosted"
          icon={<DeleteIcon w="6" h="6" color="#8000000" />}
          mr="4"
          onClick={() => {
            toast({
              title: 'Coming soon!',
              description: `Delete not supported yet.`,
              status: 'info',
              duration: 2000,
              isClosable: true,
              position: 'top',
            })
            // handleDelete(rescue.id)
          }}
        />
      </Flex>
    </Link>
  )
}
