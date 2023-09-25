import { PageTitle } from 'components/PageTitle/PageTitle'
import { useNavigate } from 'react-router-dom'
import { SmallAddIcon, CheckIcon, TimeIcon } from '@chakra-ui/icons'
import { Box, Flex } from '@chakra-ui/react'

export function WholesaleAllocation() {
  const navigate = useNavigate()

  function HomeView() {
    const homePageCards = ['New-Distribution', 'Completed', 'Remaining']

    const handleCardClick = tab => {
      if (tab === 'New-Distribution') {
        navigate(`/wholesale-new/allocation/create`)
      }
      if (tab === 'Completed') {
        navigate(`/wholesale-new/allocation/completed`)
      }
      if (tab === 'Remaining') {
        navigate(`/wholesale-new/remaining`)
      }
    }

    const getIconForTab = tab => {
      switch (tab) {
        case 'New-Distribution':
          return <SmallAddIcon />
        case 'Completed':
          return <CheckIcon />
        case 'Remaining':
          return <TimeIcon />
        default:
          return null
      }
    }

    return (
      <>
        <PageTitle>Wholesale Allocation</PageTitle>
        <Flex justify="space-between" flexDirection="row">
          {homePageCards.map(tab => (
            <Box
              key={tab}
              onClick={() => handleCardClick(tab)}
              cursor={'pointer'}
            >
              <Box
                m={4}
                width="200px"
                height="200px"
                boxShadow="md"
                borderRadius="md"
                bg="gray.700"
                animation="fadeIn 1s"
                display="flex"
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
                backgroundColor={'#4ea528'}
                color={'white'}
                fontWeight={'bold'}
                fontSize={'lg'}
              >
                {getIconForTab(tab)}
                {tab.toUpperCase()}
              </Box>
            </Box>
          ))}
        </Flex>
      </>
    )
  }

  return (
    <>
      <HomeView />
    </>
  )
}
