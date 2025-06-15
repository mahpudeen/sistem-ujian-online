import { extendTheme } from '@chakra-ui/react'

const chakraTheme = extendTheme({
  fonts: {
    heading: 'Arial, sans-serif',
    body: 'Arial, sans-serif'
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'normal',
        letterSpacing: 0.5,
        borderRadius: 4
      }
    },
    Input: {
      sizes: {
        sm: {
          field: {
            height: 9
          }
        }
      }
    },
    Select: {
      sizes: {
        sm: {
          field: {
            height: 9
          }
        }
      }
    },
    Table: {
      variants: {
        simple: {
          tr: {
            _odd: {
              background: '#F9F9F9'
            },
            _even: {
              background: '#FFF'
            },
            th: {
              borderColor: '#333',
              fontWeight: 'normal',
              color: '#333',
              textTransform: 'none',
              background: '#FFF',
              padding: '10px'
            },
            td: {
              border: 'none',
              color: '#333',
              padding: '10px'
            }
          }
        },
        stripped: {
          tr: {
            _odd: {
              background: '#F9F9F9'
            },
            _even: {
              background: '#FFF'
            },
            td: {
              color: '#333',
              padding: '10px'
            }
          }
        }
      }
    }
  },
  colors: {
    bluelight: {
      50: '#e3f8fe', // Warna sangat terang
      100: '#b3eefd', // Warna lebih terang
      200: '#80e4fb', // Warna terang
      300: '#4dd9fa', // Warna cerah
      400: '#26cff9', // Warna sedang
      500: '#00c0ef', // Base color
      600: '#00a7d1', // Warna lebih gelap
      700: '#0088ac', // Warna gelap
      800: '#006986', // Warna sangat gelap
      900: '#004c5f' // Warna paling gelap
    },
    secondaryGray: {
      100: "#E0E5F2",
      200: "#E1E9F8",
      300: "#F4F7FE",
      400: "#E9EDF7",
      500: "#8F9BBA",
      600: "#A3AED0",
      700: "#707EAE",
      800: "#707EAE",
      900: "#1B2559",
    },
  },

  styles: {
    global: (props) => ({
      body: {
        overflowX: "hidden",
        bg: "secondaryGray.300",
        letterSpacing: "-0.5px",
      }
    }),
  },
})

export default chakraTheme
