import { Button, Flex, Switch, Image, TagLeftIcon } from '@chakra-ui/react'
import { useAuth, useIsMobile } from 'hooks'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoonIcon } from '@chakra-ui/icons'

export function MenuBody({ colorMode, toggleColorMode }) {
  const { hasPermission } = useAuth()
  const isMobile = useIsMobile()
  const [darkMode, setDarkMode] = useState(colorMode === 'dark')

  useEffect(() => {
    setDarkMode(colorMode === 'dark')
  }, [colorMode])

  return (
    <Flex
      direction="column"
      py="4"
      justify="space-around"
      h="100%"
      maxH={isMobile ? '440px' : '400px'}
      mt="2"
    >
      <Flex w="100%" justify="space-between">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color="element.primary"
          fontWeight="300"
        >
          <TagLeftIcon
            boxSize="20px"
            as={MoonIcon}
            mr="4"
            color="element.secondary"
          />
          Dark Mode
        </Button>
        <Switch
          pt="2"
          size={isMobile ? 'lg' : 'md'}
          isChecked={darkMode}
          onChange={toggleColorMode}
          colorScheme="se_green"
        />
      </Flex>
      <Link to="/rescues">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/rescues'
              ? 'element.active'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/rescues' ? '600' : '300'}
          disabled={!hasPermission}
          py="0"
        >
          <Image
            src={
              darkMode ? '/menu/dark/rescues.png' : '/menu/light/rescues.png'
            }
            boxSize="20px"
            mr="4"
          />
          Rescues
        </Button>
      </Link>
      <Link to="/wholesale">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/wholesale'
              ? 'element.active'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/wholesale' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          <Image
            src={
              darkMode
                ? '/menu/dark/wholesale.png'
                : '/menu/light/wholesale.png'
            }
            boxSize="20px"
            mr="4"
          />
          Wholesale
        </Button>
      </Link>
      <Link to="/people">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/people'
              ? 'element.active'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/people' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          <Image
            src={darkMode ? '/menu/dark/people.png' : '/menu/light/people.png'}
            boxSize="20px"
            mr="4"
          />
          People
        </Button>
      </Link>
      <Link to="/organizations">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/organizations'
              ? 'element.active'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/organizations' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          <Image
            src={darkMode ? '/menu/dark/orgs.png' : '/menu/light/orgs.png'}
            boxSize="20px"
            mr="4"
          />
          Organizations
        </Button>
      </Link>
      <Link to="/analytics">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/analytics'
              ? 'element.active'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/analytics' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          <Image
            src={
              darkMode
                ? '/menu/dark/analytics.png'
                : '/menu/light/analytics.png'
            }
            boxSize="20px"
            mr="4"
          />
          Analytics
        </Button>
      </Link>
      <Link to="/food-safety">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/food-safety'
              ? 'element.active'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/food-safety' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          <Image
            src={darkMode ? '/menu/dark/food.png' : '/menu/light/food.png'}
            boxSize="20px"
            mr="4"
          />
          Food Safety
        </Button>
      </Link>
      <Link to="/help">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/help' ? 'element.active' : 'element.primary'
          }
          fontWeight={location.pathname === '/help' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          <Image
            src={darkMode ? '/menu/dark/help.png' : '/menu/light/help.png'}
            boxSize="20px"
            mr="4"
          />
          Help
        </Button>
      </Link>
    </Flex>
  )
}
