import {
  AddIcon,
  ArrowRightIcon,
  EditIcon,
  WarningIcon,
} from '@chakra-ui/icons'
import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext } from 'components'
import { createTimestamp, formatTimestamp, SE_API, STATUSES } from 'helpers'
import { useAuth } from 'hooks'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function RescueActionButtons() {
  const { rescue, refresh } = useRescueContext()
  const { user, hasAdminPermission, hasCompletedPrivateProfile } = useAuth()
  const [isStarting, setIsStarting] = useState()
  const [isCancelling, setIsCancelling] = useState()
  const [isClaiming, setIsClaiming] = useState()
  const navigate = useNavigate()

  async function handleStartRescue() {
    if (!hasCompletedPrivateProfile) {
      if (
        window.confirm(
          'Heads up!\n\nIn order to start this rescue, we need some more information about your vehicle.\n\nClick "OK" to go to your profile now.'
        )
      ) {
        navigate('/profile?tab=private')
      }
      return
    }
    if (
      window.confirm(
        "All set to go? We'll mark this as the start time of your rescue."
      )
    ) {
      setIsStarting(true)
      await Promise.all([
        SE_API.post(
          `/rescues/${rescue.id}/update`,
          {
            status: STATUSES.ACTIVE,
            timestamp_logged_start: createTimestamp(),
            timestamp_updated: createTimestamp(),
          },
          user.accessToken
        ),
        SE_API.post(
          `/stops/${rescue.stops[0].id}/update`,
          {
            status: STATUSES.ACTIVE,
            timestamp_logged_start: createTimestamp(),
            timestamp_updated: createTimestamp(),
          },
          user.accessToken
        ),
      ])
      refresh()
    }
  }

  async function handleClaimRescue() {
    if (!hasCompletedPrivateProfile) {
      if (
        window.confirm(
          'Heads up!\n\nIn order to claim a rescue, we need some more information about your vehicle.\n\nClick "OK" to go to your profile now.'
        )
      ) {
        navigate('/profile?tab=private')
      }
      return
    }
    if (
      window.confirm(
        `You're about to claim this food rescue ${formatTimestamp(
          rescue.timestamp_scheduled_start,
          'dddd, MMMM DD [at] h:mma'
        )}. All set?`
      )
    ) {
      setIsClaiming(true)
      await SE_API.post(
        `/rescues/${rescue.id}/update`,
        {
          handler_id: user.id,
          timestamp_updated: createTimestamp(),
        },
        user.accessToken
      )
      refresh()
    }
  }

  async function handleCancelRescue() {
    const reason = window.prompt(
      'Let us know why you need to cancel this rescue.\n\nNote: cancelling a rescue cannot be undone.\n'
    )
    if (reason) {
      setIsCancelling(true)
      await SE_API.post(
        `/rescues/${rescue.id}/cancel`,
        {
          status: STATUSES.CANCELLED,
          notes: 'Cancelled - ' + reason,
        },
        user.accessToken
      )
      refresh()
    }
  }

  return (
    <Flex justify="space-between" mb="4" gap="2">
      {rescue.status === STATUSES.SCHEDULED && rescue.handler_id === user.id && (
        <Button
          variant="secondary"
          size="sm"
          fontSize="xs"
          flexGrow="1"
          leftIcon={<ArrowRightIcon />}
          bg="blue.secondary"
          color="blue.primary"
          onClick={handleStartRescue}
          isLoading={isStarting}
        >
          Start
        </Button>
      )}
      {rescue.status !== STATUSES.CANCELLED && !rescue.handler_id && (
        <Button
          variant="secondary"
          size="sm"
          fontSize="xs"
          flexGrow="1"
          leftIcon={<AddIcon />}
          bg="blue.secondary"
          color="blue.primary"
          onClick={handleClaimRescue}
          isLoading={isClaiming}
        >
          Claim
        </Button>
      )}
      {![STATUSES.CANCELLED, STATUSES.COMPLETED].includes(rescue.status) &&
        hasAdminPermission && (
          <Link to={`/rescues/${rescue.id}/edit`} style={{ flexGrow: 1 }}>
            <Button
              variant="secondary"
              size="sm"
              fontSize="xs"
              w="100%"
              leftIcon={<EditIcon />}
              bg="green.secondary"
              color="green.primary"
            >
              Edit
            </Button>
          </Link>
        )}
      {![STATUSES.CANCELLED, STATUSES.COMPLETED].includes(rescue.status) &&
        (hasAdminPermission || rescue.handler_id === user.id) && (
          <Button
            variant="secondary"
            size="sm"
            fontSize="xs"
            flexGrow="1"
            leftIcon={<WarningIcon />}
            bg="yellow.secondary"
            color="yellow.primary"
            onClick={handleCancelRescue}
            isLoading={isCancelling}
          >
            Cancel
          </Button>
        )}
    </Flex>
  )
}
