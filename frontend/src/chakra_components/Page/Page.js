import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  useColorMode,
  useDisclosure,
  Link,
  Image,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { Menu } from '../'
import { useIsMobile, useAuth } from 'hooks'
import { Auth } from 'contexts'
import { Helmet } from 'react-helmet'
import PullToRefresh from 'react-simple-pull-to-refresh'

export function Page({ id, title, children, breadcrumbs }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode } = useColorMode()
  const isMobile = useIsMobile()

  return (
    <Auth>
      <Box
        as="main"
        id={id}
        className="se-page"
        w="100%"
        bg="surface.background"
      >
        <Helmet>
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content={colorMode === 'dark' ? 'black-translucent' : 'default'}
          />
        </Helmet>
        <PageHead breadcrumbs={breadcrumbs} openMenu={onOpen} />
        <Menu isOpen={isOpen} onClose={onClose} />
        <Box
          as="section"
          className="se-page-content"
          w={isMobile ? '100%' : 'calc(100% - 424px)'}
          maxW="720"
          overflow="visible"
          overflowY="scroll"
          pt="112px"
          mx="auto"
          ml={isMobile ? 'auto' : 'calc(360px + max(32px, calc(50vw - 600px)))'}
          px="4"
        >
          <PullToRefresh onRefresh={() => window.location.reload()}>
            <Heading
              as="h1"
              fontWeight="700"
              size="2xl"
              mb="24px"
              textTransform="capitalize"
              color="element.primary"
            >
              {title}
            </Heading>
            {children}
          </PullToRefresh>
        </Box>
      </Box>
    </Auth>
  )
}

function PageHead({ breadcrumbs, openMenu }) {
  const isMobile = useIsMobile()

  return (
    <Flex
      as="header"
      className="se-page-header"
      align="center"
      justify="start"
      pb="10"
      w="100%"
      maxW="1000px"
      top="0"
      left={isMobile ? 0 : 'max(32px, calc(50vw - 600px))'}
      mx="auto"
      my="0"
      position="fixed"
      zIndex="20"
      bgGradient="linear(to-b, surface.background, transparent)"
      py={['16px', '16px', '16px', '32px', '32px']}
      px={['16px', '16px', '16px', '0', '0']}
    >
      <HomeButton />
      <Box w="1" />
      {breadcrumbs && (
        <Breadcrumb
          separator={<ChevronRightIcon color="gray.400" />}
          fontSize="sm"
        >
          <BreadcrumbItem m="0" />
          {breadcrumbs.map((crumb, i) => {
            return (
              <BreadcrumbItem m="0" key={i}>
                <BreadcrumbLink
                  href={crumb.link}
                  fontWeight="light"
                  textDecoration="underline"
                >
                  {crumb.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )
          })}
        </Breadcrumb>
      )}
      {isMobile && <MenuButton openMenu={openMenu} />}
    </Flex>
  )
}

function HomeButton() {
  return (
    <Link href="/" flexShrink="0" w="48px" h="48px">
      <Image src="/logo.png" w="100%" alt="Sharing Excess Logo" />
    </Link>
  )
}

function MenuButton({ openMenu }) {
  const { user } = useAuth()
  return (
    <Avatar
      name={user.displayName}
      src={user.photoURL}
      ml="auto"
      onClick={openMenu}
      bg="blue.500"
      color="white"
    />
  )
}
