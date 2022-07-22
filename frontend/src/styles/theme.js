import { extendTheme } from '@chakra-ui/react'

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
  colors: {
    black: '#212429',
    brand: {
      primary: '#4ea528',
      light: '#E3F7DE',
      dark: '#216810',
      subtle: '#4ea52833',
    },
    green: {
      primary: '#4ea528',
      light: '#E3F7DE',
      dark: '#216810',
      subtle: '#4ea52833',
    },
    red: {
      primary: '#D84910',
      dark: '#B0390A',
      light: '#FFE7DD',
      subtle: '#D8491033',
    },
    blue: {
      primary: '#4E6CE7',
      dark: '#0E2481',
      light: '#E3EBFF',
      subtle: '#4E6CE733',
    },
    'card-dark': '#2C3135',
    'card-light': '#ffffff',
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
