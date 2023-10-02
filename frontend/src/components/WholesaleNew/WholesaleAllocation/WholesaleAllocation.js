import { PageTitle } from 'components/PageTitle/PageTitle'
import { useNavigate } from 'react-router-dom'
import { SmallAddIcon, CheckIcon, TimeIcon } from '@chakra-ui/icons'
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react'

export function WholesaleAllocation() {
  const navigate = useNavigate()

  function HomeView() {
    const homePageCards = ['Distribution', 'Completed', 'Remaining']

    const cardSize = useBreakpointValue({ base: '140px', md: '200px' })

    const handleCardClick = tab => {
      if (tab === 'Distribution') {
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
        case 'Distribution':
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
        <PageTitle>Allocation</PageTitle>
        <Flex
          pt="2"
          justify="space-between"
          wrap="wrap"
          maxW="100%"
          flexDirection="row"
        >
          {homePageCards.map(tab => (
            <Box
              key={tab}
              onClick={() => handleCardClick(tab)}
              cursor={'pointer'}
            >
              <Box
                m={2}
                width={cardSize}
                height={cardSize}
                boxShadow="md"
                borderRadius="md"
                animation="fadeIn 1s"
                display="flex"
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
                backgroundColor="#4ea528"
                color="white"
                fontWeight="bold"
                fontSize="lg"
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

  return <HomeView />
}
