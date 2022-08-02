import { extendTheme, mode } from '@chakra-ui/react'
import { SE_COLORS } from './colors'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
  },
  styles: {
    global: props => ({
      'html, body': {
        bg: props.colorMode === 'dark' ? '#212429' : '#F9FAFC',
      },
    }),
  },
  colors: SE_COLORS,
  semanticTokens: {
    colors: {
      'surface-background': {
        _dark: SE_COLORS['se-gray-900'],
        _light: SE_COLORS['se-gray-50'],
      },
      'surface-card': {
        _dark: SE_COLORS['se-gray-800'],
        _light: SE_COLORS['se-brand-white'],
      },
      'element-primary': {
        _dark: SE_COLORS['se-gray-100'],
        _light: SE_COLORS['se-gray-900'],
      },
      'element-secondary': {
        _dark: SE_COLORS['se-gray-300'],
        _light: SE_COLORS['se-gray-600'],
      },
      'element-tertiary': {
        _dark: SE_COLORS['se-gray-300'],
        _light: SE_COLORS['se-gray-300'],
      },
      'element-disabled': {
        _dark: SE_COLORS['se-gray-600'],
        _light: SE_COLORS['se-gray-200'],
      },
      'element-subtle': {
        _dark: SE_COLORS['se-gray-700'],
        _light: SE_COLORS['se-gray-100'],
      },
      'element-active': {
        _dark: SE_COLORS['se-blue-300'],
        _light: SE_COLORS['se-blue-400'],
      },
      'element-error': {
        _dark: SE_COLORS['se-red-300'],
        _light: SE_COLORS['se-red-400'],
      },
      'element-success': {
        _dark: SE_COLORS['se-green-300'],
        _light: SE_COLORS['se-green-400'],
      },
      'element-warning': {
        _dark: SE_COLORS['se-yellow-300'],
        _light: SE_COLORS['se-yellow-400'],
      },
      'blue-primary': {
        _dark: SE_COLORS['se-blue-200'],
        _light: SE_COLORS['se-blue-500'],
      },
      'blue-secondary': {
        _dark: SE_COLORS['se-blue-900'],
        _light: SE_COLORS['se-blue-100'],
      },
      'yellow-primary': {
        _dark: SE_COLORS['se-yellow-200'],
        _light: SE_COLORS['se-yellow-500'],
      },
      'yellow-secondary': {
        _dark: SE_COLORS['se-yellow-900'],
        _light: SE_COLORS['se-yellow-100'],
      },
      'green-primary': {
        _dark: SE_COLORS['se-green-200'],
        _light: SE_COLORS['se-green-500'],
      },
      'green-secondary': {
        _dark: SE_COLORS['se-green-900'],
        _light: SE_COLORS['se-green-100'],
      },
      'red-primary': {
        _dark: SE_COLORS['se-red-200'],
        _light: SE_COLORS['se-red-500'],
      },
      'red-secondary': {
        _dark: SE_COLORS['se-red-900'],
        _light: SE_COLORS['se-red-100'],
      },
    },
  },
  fonts: {
    heading: `'Poppins', sans-serif`,
    body: `'Poppins', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '300',
      },
      variants: {
        solid: {
          bg: 'primary',
          color: 'white',
          fontWeight: '600',
        },
      },
    },
  },
})

export default theme
