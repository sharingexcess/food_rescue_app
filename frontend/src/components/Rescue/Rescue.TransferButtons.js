import {
  EditIcon,
  ExternalLinkIcon,
  InfoIcon,
  PhoneIcon,
} from '@chakra-ui/icons'
import { Button, Flex } from '@chakra-ui/react'
import { useRescueContext } from 'components'
import { formatPhoneNumber, generateDirectionsLink } from 'helpers'

export function TransferButtons({ transfer }) {
  const { setOpenTransfer, activeTransfer } = useRescueContext()
  const isActive = transfer.id === activeTransfer?.id

  return (
    <>
      <Flex justify="space-between" mb="4" gap="2">
        <Button
          variant={isActive ? 'secondary' : 'tertiary'}
          disabled={!transfer.location.contact_phone}
          size="sm"
          fontSize="xs"
          flexGrow="1"
          leftIcon={<PhoneIcon />}
        >
          {transfer.location.contact_phone ? (
            <a href={`tel:+${transfer.location.contact_phone}`}>
              {formatPhoneNumber(transfer.location.contact_phone)}
            </a>
          ) : (
            'No Phone'
          )}
        </Button>
        <a
          href={generateDirectionsLink(
            transfer.location.address1,
            transfer.location.city,
            transfer.location.state,
            transfer.location.zip
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
          onClick={() => setOpenTransfer(transfer)}
          leftIcon={<InfoIcon />}
          disabled={!transfer.location.notes}
        >
          {transfer.location.notes ? 'Instructions' : 'No Instructions'}
        </Button>
      </Flex>
      <Button
        width="100%"
        variant={isActive ? 'primary' : 'secondary'}
        size="lg"
        textTransform="capitalize"
        mb="2"
        onClick={() => setOpenTransfer(transfer)}
        leftIcon={<EditIcon />}
      >
        Open {transfer.type}
      </Button>
    </>
  )
}
