import { Input } from '@chakra-ui/react'
import { Page, Loading } from 'chakra_components'
import { useState } from 'react'

export function ChakraTest() {
  const [searchValue, setSearchValue] = useState('')
  return <Loading />
  return (
    <Page
      id="ChakraTest"
      title="Test Page"
      breadcrumbs={[
        { label: 'Breadcrumb', link: '/test' },
        { label: 'Page', link: `/test` },
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
