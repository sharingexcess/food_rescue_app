import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  useDisclosure,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { Menu } from '../'
import { useIsMobile, useAuth } from 'hooks'
import { Auth } from 'contexts'
import { Link } from 'react-router-dom'

export function Page({ id, title, children, breadcrumbs }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Auth>
      <Box
        as="main"
        id={id}
        className="se-page"
        w="100%"
        p={['16px', '18px', '24px', '32px', '48px']}
        bg="surface.background"
      >
        <PageHead breadcrumbs={breadcrumbs} openMenu={onOpen} />
        <Flex h="calc(100% - 80px)" w="100%" justify="center">
          <Menu isOpen={isOpen} onClose={onClose} />
          <Box
            as="section"
            className="se-page-content"
            w="100%"
            maxW="640"
            pb="4"
            overflow="visible"
          >
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
          </Box>
        </Flex>
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
      pb="24px"
      maxW="984"
      m="auto"
    >
      <HomeButton />
      <Box w="1" />
      {breadcrumbs && (
        <Breadcrumb separator={<ChevronRightIcon color="gray.400" />}>
          <BreadcrumbItem m="0" />
          {breadcrumbs.map((crumb, i) => {
            const isCurrentPage = i === breadcrumbs.length - 1
            return (
              <BreadcrumbItem m="0" key={i} isCurrentPage={isCurrentPage}>
                <BreadcrumbLink
                  href={crumb.link}
                  fontWeight={isCurrentPage ? 'medium' : 'light'}
                  textDecoration={isCurrentPage ? 'none' : 'underline'}
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
    <Link to="/">
      <img
        src="/logo.png"
        style={{ height: 48, width: 48 }}
        alt="Sharing Excess Logo"
      />
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
