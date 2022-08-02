import { Button } from '@chakra-ui/react'
import { Page } from 'chakra_components'

export function ChakraTest() {
  return (
    <Page
      id="ChakraTest"
      title="Test Page"
      breadcrumbs={[
        { label: 'Breadcrumb', link: '/chakra/test' },
        { label: 'Page', link: `/chakra/test` },
      ]}
    >
      <Button variant="tertiary" disabled>
        Default Button
      </Button>
    </Page>
  )
}
