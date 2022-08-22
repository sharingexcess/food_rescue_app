import {
  EditIcon,
  ExternalLinkIcon,
  InfoIcon,
  PhoneIcon,
} from '@chakra-ui/icons'
import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext } from 'components'
import { formatPhoneNumber, generateDirectionsLink } from 'helpers'

export function StopButtons({ stop }) {
  const { setOpenStop, activeStop } = useRescueContext()
  const isActive = stop.id === activeStop?.id

  return (
    <>
      <Flex justify="space-between" mb="4" gap="2">
        <Button
          variant={isActive ? 'secondary' : 'tertiary'}
          disabled={!stop.location.contact_phone}
          size="sm"
          fontSize="xs"
          flexGrow="1"
          leftIcon={<PhoneIcon />}
        >
          {stop.location.contact_phone ? (
            <a href={`tel:+${stop.location.contact_phone}`}>
              {formatPhoneNumber(stop.location.contact_phone)}
            </a>
          ) : (
            'No Phone'
          )}
        </Button>
        <a
          href={generateDirectionsLink(
            stop.location.address1,
            stop.location.city,
            stop.location.state,
            stop.location.zip
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="sm"
            fontSize="xs"
            flexGrow={1}
            textDecoration="none !important"
            variant={isActive ? 'secondary' : 'tertiary'}
            leftIcon={<ExternalLinkIcon />}
          >
            Map
          </Button>
        </a>
        <Button
          variant={isActive ? 'secondary' : 'tertiary'}
          size="sm"
          fontSize="xs"
          flexGrow="1"
          onClick={() => setOpenStop(stop)}
          leftIcon={<InfoIcon />}
          disabled={!stop.location.notes}
        >
          {stop.location.notes ? 'Instructions' : 'No Instructions'}
        </Button>
      </Flex>
      <Button
        width="100%"
        variant={isActive ? 'primary' : 'secondary'}
        size="lg"
        textTransform="capitalize"
        mb="2"
        onClick={() => setOpenStop(stop)}
        leftIcon={<EditIcon />}
      >
        Open {stop.type}
      </Button>
    </>
  )
}
