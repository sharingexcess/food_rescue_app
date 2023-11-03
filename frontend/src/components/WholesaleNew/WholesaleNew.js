import {
  Box,
  Flex,
  useBreakpointValue,
  useToast,
  Collapse,
  Button,
} from '@chakra-ui/react'
import { PageTitle } from 'components/PageTitle/PageTitle'
import { useNavigate } from 'react-router-dom'
import WarehouseConfig from 'components/WarehouseConfig/WarehouseConfig'
import { useState, useEffect } from 'react'
import { FooterButton } from 'components'
import { SE_API } from 'helpers'
import {
  TriangleDownIcon,
  AttachmentIcon,
  TimeIcon,
  ViewIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons'
import { useAuth } from 'hooks'

export function WholesaleNew() {
  const navigate = useNavigate()

  function HomeView() {
    const homePageCards = ['entry', 'allocation', 'remaining']
    const { user, hasAdminPermission } = useAuth()
    const [isLoading, setIsLoading] = useState()
    const [showSettings, setShowSettings] = useState(false)

    const toast = useToast()

    const [jackData, setJackData] = useState(user.jacks || [])

    const handleJacksChange = jacks => {
      setJackData(jacks)
    }

    const toggleSettings = () => setShowSettings(!showSettings)

    const [formData, setFormData] = useState({
      email: user.email,
      name: user.name || '',
      pronouns: user.pronouns || '',
      about_me: user.about_me || '',
      icon: user.icon,
      permission: user.permission,
      jacks: user.jacks,
    })

    useEffect(() => {
      setFormData(prevFormData => ({
        ...prevFormData,
        jacks: jackData,
      }))

      console.log('formData', formData)
    }, [jackData])

    const handleCardClick = tab => {
      console.log(tab)
      navigate(`/wholesale-new/${tab}`)
    }

    const cardSize = useBreakpointValue({ base: '140px', md: '200px' })

    async function handleSubmit() {
      setIsLoading(true)
      try {
        await SE_API.post(
          `/public_profiles/update/${user.uid}`,
          formData,
          user.accessToken
        )
      } catch (e) {
        toast({
          title: 'Whoops!',
          description:
            'Looks like there was an error updating your profile. Make sure you filled out all of the fields correctly.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        return
      }
      toast({
        title: 'All set!',
        description: 'Your profile has been updated.',
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
      window.location.reload()
      setIsLoading(false)
    }

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

        {hasAdminPermission && (
          <>
            <Button
              onClick={toggleSettings}
              mt="4"
              leftIcon={showSettings ? <ChevronUpIcon /> : <ChevronDownIcon />}
            >
              {showSettings ? 'Hide Config' : 'Warehouse Config'}
            </Button>
            <Collapse in={showSettings} animateOpacity>
              <Box mt="4" p="4" borderWidth="1px" borderRadius="md">
                <WarehouseConfig
                  onJacksChange={handleJacksChange}
                  formData={formData}
                />
                <FooterButton
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  loadingText="Updating public profile..."
                  leftIcon={<ViewIcon />}
                  right="0"
                >
                  Update configuration
                </FooterButton>
              </Box>
            </Collapse>
          </>
        )}
      </>
    )
  }

  return <HomeView />
}
