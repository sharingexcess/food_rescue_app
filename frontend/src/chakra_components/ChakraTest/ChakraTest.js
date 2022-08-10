import { Button, Input } from '@chakra-ui/react'
import { Page } from 'chakra_components'
import { useState } from 'react'

export function ChakraTest() {
  const [searchValue, setSearchValue] = useState('')
  return (
    <Page
      id="ChakraTest"
      title="Test Page"
      breadcrumbs={[
        { label: 'Breadcrumb', link: '/chakra/test' },
        { label: 'Page', link: `/chakra/test` },
      ]}
    >
      <Input
        placeholder="Search by name..."
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
      />
    </Page>
  )
}
