import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  InputGroup,
  Text,
} from '@chakra-ui/react'
import { useRescueContext, CardOverlay } from 'components'
import { SE_API, STATUSES, TRANSFER_TYPES } from 'helpers'
import { useAuth } from 'hooks'
import moment from 'moment'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function CompletedRescue({ isOpen, handleClose }) {
  const { rescue } = useRescueContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const totalWeight = useMemo(
    () =>
      rescue?.transfers &&
      rescue.transfers
        .filter(i => i.type === TRANSFER_TYPES.DISTRIBUTION)
        .reduce((total, current) => (total += current.total_weight), 0),
    [rescue]
  )

  function CompletedRescueHeader() {
    return (
      <Heading as="h2" size="2xl">
        You did it!
      </Heading>
    )
  }

  function CompletedRescueBody() {
    return (
      <>
        <Text align="center" mb="6">
          We can check this one off the list ✅
        </Text>
        <Text align="center">
          Thanks for driving with Sharing Excess!
          <br />
          You rescued{' '}
          <Text as="span" color="element.success" fontWeight="600">
            {totalWeight} lbs.
          </Text>{' '}
          of food today.
        </Text>
        <Image
          w="64%"
          maxW="240px"
          mt="16"
          mb="4"
          mx="auto"
          src="/completed_rescue.png"
          alt="Rescue Completed"
        />
      </>
    )
  }

  function CompletedRescueFooter() {
    const [notes, setNotes] = useState(rescue.notes || '')

    function handleNotesChange(value) {
      setNotes(value)
    }

    async function handleClick() {
      if (notes.length && notes !== rescue.notes) {
        setIsLoading(true)
        await SE_API.post(
          `/rescues/update/${rescue.id}`,
          {
            id: rescue.id,
            type: rescue.type,
            status: STATUSES.COMPLETED,
            handler_id: rescue.handler_id,
            timestamp_scheduled: rescue.timestamp_scheduled,
            timestamp_completed: moment().toISOString(),
            transfer_ids: rescue.transfer_ids,
            notes,
          },
          user.accessToken
        )
        setIsLoading(false)
      }
      navigate('/')
    }

    return (
      <Box w="100%">
        <Text fontSize="sm" fontWeight="500" color="element.secondary">
          Add notes to this rescue...
        </Text>
        <InputGroup>
          <Input
            value={notes || ''}
            placeholder="Tell us about your rescue..."
            onChange={e => handleNotesChange(e.target.value)}
            mb="4"
          />
        </InputGroup>
        <Button
          size="lg"
          w="100%"
          onClick={handleClick}
          disabled={isLoading}
          isLoading={isLoading}
          loadingText="Saving notes..."
        >
          {notes.length && notes !== rescue.notes
            ? 'Save Notes'
            : 'Back to Home'}
        </Button>
      </Box>
    )
  }

  return (
    <CardOverlay
      isOpen={isOpen}
      closeHandler={handleClose}
      CardHeader={CompletedRescueHeader}
      CardBody={CompletedRescueBody}
      CardFooter={CompletedRescueFooter}
    />
  )
}
