import {
  AddIcon,
  ArrowRightIcon,
  EditIcon,
  WarningIcon,
} from '@chakra-ui/icons'
import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext } from 'components'
import { formatTimestamp, SE_API, STATUSES } from 'helpers'
import { useAuth } from 'hooks'
import moment from 'moment'
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
        "All set to go? We'll update your rescue to mark it active."
      )
    ) {
      setIsStarting(true)
      await Promise.all([
        SE_API.post(
          `/rescues/update/${rescue.id}`,
          {
            id: rescue.id,
            type: rescue.type,
            status: STATUSES.ACTIVE,
            handler_id: rescue.handler_id,
            notes: rescue.notes,
            timestamp_scheduled: moment(
              rescue.timestamp_scheduled
            ).toISOString(),
            timestamp_completed: null,
            transfer_ids: rescue.transfer_ids,
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
          rescue.timestamp_scheduled,
          'dddd, MMMM DD [at] h:mma'
        )}. All set?`
      )
    ) {
      setIsClaiming(true)
      const promises = []
      promises.push(
        SE_API.post(
          `/rescues/update/${rescue.id}`,
          {
            id: rescue.id,
            type: rescue.type,
            status: rescue.status,
            handler_id: user.id,
            notes: rescue.notes,
            timestamp_scheduled: moment(
              rescue.timestamp_scheduled
            ).toISOString(),
            timestamp_completed: null,
            transfer_ids: rescue.transfer_ids,
          },
          user.accessToken
        )
      )
      for (const transfer of rescue.transfers) {
        promises.push(
          SE_API.post(
            `/transfers/update/${transfer.id}`,
            {
              type: transfer.type,
              status: transfer.status,
              rescue_id: transfer.rescue_id,
              handler_id: user.id,
              organization_id: transfer.organization_id,
              location_id: transfer.location_id,
              notes: transfer.notes,
              timestamp_completed: null,
              total_weight: transfer.total_weight,
              categorized_weight: transfer.categorized_weight,
            },
            user.accessToken
          )
        )
      }
      // wait for all api calls to complete
      await Promise.all(promises)

      refresh()
    }
  }

  async function handleCancelRescue() {
    // validate that the user knows what they're doing if this rescue is already completed
    if (rescue.status === STATUSES.COMPLETED) {
      if (!user.hasAdminPermission) {
        window.alert(
          'Only admins can cancel a completed rescue. If you need to cancel this rescue, contact an SE admin.'
        )
        return
      }
      const confirmation = window.confirm(
        'Are you sure you want to cancel this completed rescue? This will delete all impact data from the rescue.'
      )
      if (!confirmation) return
    }
    const reason = window.prompt(
      'Let us know why you need to cancel this rescue.\n\nNote: cancelling a rescue cannot be undone.\n'
    )
    if (reason) {
      setIsCancelling(true)
      await SE_API.post(
        `/rescues/cancel/${rescue.id}`,
        {
          notes: 'Cancelled - ' + reason,
        },
        user.accessToken
      )
      refresh()
    }
  }

  return (
    <Flex justify="space-between" mb="4" gap="2">
      {rescue.status === STATUSES.SCHEDULED &&
        (hasAdminPermission || rescue.handler_id === user.id) && (
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
      {![STATUSES.CANCELLED].includes(rescue.status) &&
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
