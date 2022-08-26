import { Button, Flex, Switch } from '@chakra-ui/react'
import { useAuth, useIsMobile } from 'hooks'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function MenuBody({ colorMode, toggleColorMode }) {
  const { hasPermission } = useAuth()
  const isMobile = useIsMobile()
  const [darkMode, setDarkMode] = useState(colorMode === 'dark')

  useEffect(() => {
    setDarkMode(colorMode === 'dark')
  }, [colorMode])

  return (
    <Flex direction="column" py="4">
      <Flex w="100%" justify="space-between" /* my="2" */>
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color="element.primary"
          fontWeight="300"
          fontSize="md"
        >
          Dark Mode
        </Button>
        <Switch
          pt="2"
          size={isMobile ? 'lg' : 'md'}
          isChecked={darkMode}
          onChange={toggleColorMode}
          colorScheme="green"
        />
      </Flex>
      <Link to="/rescues">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/rescues'
              ? 'blue.primary'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/rescues' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          /* my={isMobile ? '2' : '1'} */
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          Rescues
        </Button>
      </Link>
      <Link to="/wholesale">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/wholesale'
              ? 'blue.primary'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/wholesale' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          /*  my={isMobile ? '2' : '1'} */
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          Wholesale
        </Button>
      </Link>
      <Link to="/people">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/people' ? 'blue.primary' : 'element.primary'
          }
          fontWeight={location.pathname === '/people' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          /* my={isMobile ? '2' : '1'} */
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          People
        </Button>
      </Link>
      <Link to="/organizations">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/organizations'
              ? 'blue.primary'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/organizations' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          /* my={isMobile ? '2' : '1'} */
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          Organizations
        </Button>
      </Link>
      <Link to="/analytics">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/analytics'
              ? 'blue.primary'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/analytics' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          /* my={isMobile ? '2' : '1'} */
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          Analytics
        </Button>
      </Link>
      <Link to="/food-safety">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/food-safety'
              ? 'blue.primary'
              : 'element.primary'
          }
          fontWeight={location.pathname === '/food-safety' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          /* my={isMobile ? '2' : '1'} */
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          Food Safety
        </Button>
      </Link>
      <Link to="/help">
        <Button
          variant="ghosted"
          px={isMobile ? '0' : '2'}
          color={
            location.pathname === '/help' ? 'blue.primary' : 'element.primary'
          }
          fontWeight={location.pathname === '/help' ? '600' : '300'}
          fontSize="md"
          mr="auto"
          /* my={isMobile ? '2' : '1'} */
          disabled={!hasPermission}
          height={isMobile ? '12' : '9'}
        >
          Help
        </Button>
      </Link>
    </Flex>
  )
}
