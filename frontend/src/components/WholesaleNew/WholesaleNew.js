import { Box, Flex, useBreakpointValue } from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { useNavigate } from 'react-router-dom'
import { TriangleDownIcon, AttachmentIcon, TimeIcon } from '@chakra-ui/icons'

export function WholesaleNew() {
  const navigate = useNavigate()

  function HomeView() {
    const homePageCards = ['entry', 'allocation', 'remaining']

    const handleCardClick = tab => {
      console.log(tab)
      navigate(`/wholesale-new/${tab}`)
    }

    const cardSize = useBreakpointValue({ base: '140px', md: '200px' })

    const getIconForTab = tab => {
      switch (tab) {
        case 'entry':
          return <TriangleDownIcon />
        case 'allocation':
          return <AttachmentIcon />
        case 'remaining':
          return <TimeIcon />
        default:
          return null
      }
    }

    return (
      <>
        <PageTitle>Wholesale</PageTitle>
        <Flex
          pt="2"
          justify="space-between"
          wrap="wrap"
          maxW="100%"
          flexDirection="row"
        >
          {homePageCards.map((tab, index) => (
            <Box
              key={tab}
              onClick={() => handleCardClick(tab)}
              id={index}
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
                textDecoration={'none'}
                textDecorationLine={'none'}
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
