import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Switch,
  useColorMode,
} from '@chakra-ui/react'
import { useAuth, useIsMobile } from 'hooks'
import { useEffect, useState } from 'react'

export function LandingHeader() {
  const { handleLogin } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()
  const [darkMode, setDarkMode] = useState(colorMode === 'dark')
  const isMobile = useIsMobile()

  useEffect(() => {
    setDarkMode(colorMode === 'dark')
  }, [colorMode])

  return (
    <Flex as="header" justify="space-between" align="center">
      <Image
        src="/logo.png"
        flexShrink="0"
        w="42px"
        h="42px"
        alt="Sharing Excess Logo"
        boxShadow="md"
      />
      <Box>
        {isMobile ? (
          <>
            <IconButton
              variant="secondary"
              icon={darkMode ? <SunIcon /> : <MoonIcon />}
              onClick={toggleColorMode}
              mr="2"
            />
            <Button onClick={handleLogin}>Sign In</Button>
          </>
        ) : (
          <Flex align="center" gap="2">
            <SunIcon />
            <Switch
              size={isMobile ? 'lg' : 'md'}
              isChecked={darkMode}
              onChange={toggleColorMode}
              colorScheme="green"
            />
            <MoonIcon />
            <Button ml="8" onClick={handleLogin}>
              Sign In
            </Button>
          </Flex>
        )}
      </Box>
    </Flex>
  )
}
