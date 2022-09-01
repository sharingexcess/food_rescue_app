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
import { Menu } from 'components'
import { useIsMobile, useAuth, useScroll } from 'hooks'
import { Helmet } from 'react-helmet'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IS_DEV_ENVIRONMENT } from 'helpers'

export function Page({
  id,
  defaultTitle,
  defaultBreadcrumbs,
  Content,
  pageContentStyle,
  pullToRefresh = true,
}) {
  const [title, setTitle] = useState(defaultTitle)
  const [breadcrumbs, setBreadcrumbs] = useState(defaultBreadcrumbs)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode } = useColorMode()
  const isMobile = useIsMobile()

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
        {...pageContentStyle}
      >
        {isMobile && pullToRefresh ? (
          <PullToRefresh
            onRefresh={() => window.location.reload()}
            className="se-pull-to-refresh"
          >
            <Content setTitle={setTitle} setBreadcrumbs={setBreadcrumbs} />
          </PullToRefresh>
        ) : (
          <Content setTitle={setTitle} setBreadcrumbs={setBreadcrumbs} />
        )}
      </Box>
      <EnvWarning />
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
      <Box
        position="fixed"
        top={isMobile ? `${position - 96}px` : '-96px'}
        transition="top 0.1s ease"
        left="0"
        h="96px"
        w="100%"
        bg="surface.background"
        zIndex="20"
      />
      <HomeButton />
      <Box w="1" />
      {breadcrumbs && (
        <Breadcrumb
          separator={<ChevronRightIcon color="element.tertiary" />}
          fontSize="sm"
          position="relative"
          py="1"
          px="4"
          textShadow="sm"
        >
          {isMobile && breadcrumbs.length > 1 ? null : (
            <BreadcrumbItem m="0" ml="-4" />
          )}
          {breadcrumbs.map((crumb, i) => {
            return (
              <BreadcrumbItem m="0" key={i}>
                <Link to={crumb.link}>
                  <Text
                    py="1px"
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
    <Link to="/" style={{ flexShrink: 0 }}>
      <Image
        src={isHomePage && isMobile ? '/logo_white.png' : '/logo.png'}
        flexShrink="0"
        w="42px"
        h="42px"
        alt="Sharing Excess Logo"
        boxShadow="md"
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
      boxShadow="md"
      cursor="pointer"
    />
  ) : null
}

export function EnvWarning() {
  const [expanded, setExpanded] = useState(false)

  let content

  if (IS_DEV_ENVIRONMENT && window.location.hostname !== 'localhost') {
    content =
      'You are currently in the development environment. This is not real data!'
  } else if (!IS_DEV_ENVIRONMENT && window.location.hostname === 'localhost') {
    content =
      'You are currently in the production environment. This is real data!'
  }
  return content ? (
    <Flex
      id="EnvWarning"
      onClick={() => setExpanded(!expanded)}
      position="fixed"
      bottom="4"
      right="4"
      height="12"
      width={expanded ? 'calc(100% - 32px)' : '12'}
      borderRadius="full"
      background="red"
      color="white"
      zIndex="50"
      overflow="hidden"
      justify="start"
      align="center"
      cursor="pointer"
      transition="width 0.2s ease"
      pr="6"
    >
      <Text
        fontSize="3xl"
        fontWeight="700"
        w="12"
        h="100%"
        color="se.brand.white"
        flexShrink="0"
        align="center"
      >
        !
      </Text>
      <Text fontSize="xs" color="se.brand.white" align="center" flexGrow="1">
        {content}
      </Text>
    </Flex>
  ) : null
}
