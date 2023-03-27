import { Box, Heading, Text } from '@chakra-ui/react'
import { TransferButtons } from './Rescue.TransferButtons'

export function ActiveTransfer({ transfer }) {
  return (
    <Box
      px="4"
      my="2"
      py="2"
      background="surface.card"
      boxShadow="default"
      borderRadius="lg"
    >
      <Heading
        as="h6"
        fontWeight="600"
        letterSpacing={1}
        fontSize="sm"
        color="se.brand.primary"
        textTransform="uppercase"
        py="2"
      >
        ⏩&nbsp;&nbsp;{transfer.type}
      </Heading>
      <Heading as="h3" size="md" fontWeight="600" color="element.primary">
        {transfer.organization.name}
      </Heading>
      <Text as="p" fontWeight="300" color="element.secondary">
        {transfer.location.nickname || transfer.location.address1}
      </Text>
      <Box h="4" />
      <TransferButtons transfer={transfer} />
    </Box>
  )
}
