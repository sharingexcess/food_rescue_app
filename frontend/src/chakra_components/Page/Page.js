import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  useColorMode,
  useDisclosure,
  Image,
  Text,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { Menu } from '../'
import { useIsMobile, useAuth, useScroll } from 'hooks'
import { Helmet } from 'react-helmet'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function Page({
  id,
  title,
  children,
  breadcrumbs,
  contentProps,
  pullToRefresh = true,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode } = useColorMode()
  const isMobile = useIsMobile()

  const withPullToRefresh = children => (
    <PullToRefresh onRefresh={() => window.location.reload()}>
      {children}
    </PullToRefresh>
  )

  return (
    <Box
      as="main"
      id={id}
      className="se-page"
      w="100%"
      h="100vh"
      bg="surface.background"
    >
      <Helmet>
        <title>{title} | SE Food Rescue</title>
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={colorMode === 'dark' ? 'black-translucent' : 'default'}
        />
      </Helmet>
      <PageHead breadcrumbs={breadcrumbs} openMenu={onOpen} />
      <Menu isOpen={isOpen} onClose={onClose} />
      <Box
        as="section"
        id="se-page-content"
        w={isMobile ? '100%' : 'calc(100% - 424px)'}
        maxW="720"
        overflow="visible"
        pt="112px"
        pb="32px"
        mx="auto"
        ml={isMobile ? 'auto' : 'calc(360px + max(32px, calc(50vw - 600px)))'}
        px="4"
        minH="100%"
        {...contentProps}
      >
        {isMobile && pullToRefresh ? withPullToRefresh(children) : children}
      </Box>
    </Box>
  )
}

function PageHead({ breadcrumbs, openMenu }) {
  const isMobile = useIsMobile()
  const scroll = useScroll()
  const [prevScroll, setPrevScroll] = useState(scroll)
  const [position, setPosition] = useState(0)

  useEffect(() => {
    const pageHeight = document.getElementById('se-page-content').offsetHeight
    // handle scroll down only for a page with a scrollable size
    if (scroll > prevScroll && scroll > 0 && window.innerHeight < pageHeight) {
      setPosition(Math.max(-100, position - 20))
    }
    // handle scroll up only on a scroll of force > 5
    if (scroll < prevScroll && prevScroll - scroll > 5) {
      setPosition(0)
    }
    setPrevScroll(scroll)
  }, [scroll]) // eslint-disable-line

  const isHomePage = location.pathname === '/'

  return (
    <Flex
      as="header"
      className="se-page-header"
      align="center"
      justify="start"
      w="100%"
      top={isMobile ? position : 0}
      left={isMobile ? 0 : 'max(32px, calc(50vw - 600px))'}
      mx="auto"
      my="0"
      position="fixed"
      zIndex="20"
      bgGradient={
        isHomePage
          ? null
          : isMobile
          ? 'linear(to-b, surface.background, surface.background, transparent)'
          : 'linear(to-b, surface.background, transparent)'
      }
      pt={['16px', '16px', '16px', '32px', '32px']}
      pb={['32px', '32px', '32px', '32px', '32px']}
      px={['16px', '16px', '16px', '0', '0']}
      transition="top 0.3s ease"
    >
      <HomeButton />
      <Box w="1" />
      {breadcrumbs && (
        <Breadcrumb
          separator={<ChevronRightIcon color="element.tertiary" />}
          fontSize="sm"
          position="relative"
          py="1"
          pr="4"
        >
          <BreadcrumbItem m="0" />
          {breadcrumbs.map((crumb, i) => {
            return (
              <BreadcrumbItem m="0" key={i}>
                <Link to={crumb.link}>
                  <Text
                    fontWeight={i === breadcrumbs.length - 1 ? '400' : '300'}
                    color={
                      i === breadcrumbs.length - 1
                        ? 'element.primary'
                        : 'element.secondary'
                    }
                    textDecoration={
                      i === breadcrumbs.length - 1 ? 'none' : 'underline'
                    }
                    zIndex="3"
                    textTransform="capitalize"
                  >
                    {crumb.label}
                  </Text>
                </Link>
              </BreadcrumbItem>
            )
          })}
        </Breadcrumb>
      )}
      <MenuButton openMenu={openMenu} />
    </Flex>
  )
}

function HomeButton() {
  const isMobile = useIsMobile()
  const isHomePage = location.pathname === '/'

  return (
    <Link to="/">
      <Image
        src={isHomePage && isMobile ? '/logo_white.png' : '/logo.png'}
        flexShrink="0"
        w="42px"
        h="42px"
        alt="Sharing Excess Logo"
      />
    </Link>
  )
}

function MenuButton({ openMenu }) {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  return isMobile ? (
    <Avatar
      name={user?.displayName}
      w="42px"
      h="42px"
      src={user?.photoURL}
      ml="auto"
      onClick={openMenu}
      bg="blue.500"
      color="white"
    />
  ) : null
}
