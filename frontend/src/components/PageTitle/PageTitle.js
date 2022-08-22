import { Heading } from '@chakra-ui/react'

export function PageTitle(props) {
  return (
    <Heading
      as="h1"
      fontWeight="700"
      size="2xl"
      textTransform="capitalize"
      color="element.primary"
      mb="6"
      {...props}
    >
      {props.children}
    </Heading>
  )
}
