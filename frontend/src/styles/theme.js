import { extendTheme } from '@chakra-ui/react'
import { darken, whiten } from '@chakra-ui/theme-tools'
import { SE_COLORS } from './colors'

const styles = {
  global: props => ({
    'html, body': {
      bg: 'surface.background',
    },
  }),
}

const semanticTokens = {
  colors: {
    'surface.background': {
      _dark: 'se.gray.900',
      _light: 'se.gray.50',
    },
    'surface.card': {
      _dark: 'se.gray.800',
      _light: 'se.brand.white',
    },
    'element.primary': {
      _dark: 'se.gray.100',
      _light: 'se.gray.900',
    },
    'element.secondary': {
      _dark: 'se.gray.300',
      _light: 'se.gray.600',
    },
    'element.tertiary': {
      _dark: 'se.gray.600',
      _light: 'se.gray.300',
    },
    'element.disabled': {
      _dark: 'se.gray.600',
      _light: 'se.gray.200',
    },
    'element.subtle': {
      _dark: 'se.gray.700',
      _light: 'se.gray.100',
    },
    'element.active': {
      _dark: 'se.blue.300',
      _light: 'se.blue.400',
    },
    'element.error': {
      _dark: 'se.red.300',
      _light: 'se.red.400',
    },
    'element.success': {
      _dark: 'se.green.300',
      _light: 'se.green.400',
    },
    'element.warning': {
      _dark: 'se.yellow.300',
      _light: 'se.yellow.400',
    },
    'blue.primary': {
      _dark: 'se.blue.200',
      _light: 'se.blue.500',
    },
    'blue.secondary': {
      _dark: 'se.blue.900',
      _light: 'se.blue.100',
    },
    'yellow.primary': {
      _dark: 'se.yellow.100',
      _light: 'se.yellow.500',
    },
    'yellow.secondary': {
      _dark: 'se.yellow.900',
      _light: 'se.yellow.100',
    },
    'green.primary': {
      _dark: 'se.green.200',
      _light: 'se.green.500',
    },
    'green.secondary': {
      _dark: 'se.green.900',
      _light: 'se.green.100',
    },
    'red.primary': {
      _dark: 'se.red.200',
      _light: 'se.red.500',
    },
    'red.secondary': {
      _dark: 'se.red.900',
      _light: 'se.red.100',
    },
  },
  shadows: {
    default: {
      _dark: '0 4px 16px 0 rgba(18, 19, 19, 0.5)',
      _light:
        '0 2px 8px 0 rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.25)',
    },
  },
}

const fonts = {
  heading: `'Poppins', sans-serif`,
  body: `'Poppins', sans-serif`,
  // heading: `'Montserrat', sans-serif`,
  // body: `'Montserrat', sans-serif`,
}

const colors = { se: SE_COLORS }

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
  },
  styles,
  colors,
  semanticTokens,
  fonts,
  components: {
    Button: {
      baseStyle: {
        fontWeight: 400,
      },
      // 3. We can add a new visual variant
      variants: {
        primary: props => ({
          bg: 'se.brand.primary',
          color: 'se.brand.white',
          fontWeight: 'medium',
          _hover: {
            bg:
              props.colorMode === 'dark'
                ? whiten('se.brand.primary', 10)
                : darken('se.brand.primary', 5),
            _disabled: {
              bg: 'element.disabled',
              opacity: 0.4,
            },
          },
          _disabled: {
            bg: 'element.disabled',
            opacity: 0.4,
          },
        }),
        secondary: props => ({
          bg: 'green.secondary',
          color: 'green.primary',
          fontWeight: 'medium',
          _hover: {
            _disabled: {
              bg: 'green.secondary',
              color: 'green.primary',
              opacity: 0.5,
            },
          },
          _disabled: {
            bg: 'green.secondary',
            color: 'green.primary',
            opacity: 0.5,
          },
        }),
        tertiary: props => ({
          color: 'se.brand.primary',
          textDecoration: 'underline',
          _hover: {
            color:
              props.colorMode === 'dark'
                ? whiten('se.brand.primary', 20)
                : darken('se.brand.primary', 10),
            _disabled: {
              color: 'element.disabled',
              opacity: 1,
            },
          },
          _disabled: {
            color: 'element.disabled',
            opacity: 1,
          },
        }),
      },
      defaultProps: {
        variant: 'primary',
      },
    },
    Input: {
      defaultProps: {
        variant: 'flushed',
      },
      variants: {
        flushed: {
          field: {
            _placeholder: {
              color: 'element.secondary',
            },
          },
        },
      },
    },
  },
})

export default theme
