import { defineConfig } from 'windicss/helpers';
import plugin from 'windicss/plugin';

export default defineConfig({
  theme: {
    extend: {
      colors: {
        primary: '#4169e1',
        trusted: '#2e8b57',
        redirect: '#ff7f50',
        custom: '#1e90ff',
        suspicious: '#ef3038',
        unknown: '#343434'
      }
    }
  },
  shortcuts: {
    'btn-primary': {
      '@apply': 'bg-primary',
      '&:hover': {
        backgroundColor: '#1c1cf0'
      }
    },
    'btn-suspicious': {
      '@apply': 'bg-suspicious',
      '&:hover': {
        backgroundColor: '#ce2029'
      }
    },
    'option-btn': {
      '@apply': 'text-sm px-4 py-2 text-white disabled:bg-gray-200 disabled:pointer-events-none rounded'
    },
    'dropdown-btn': {
      '@apply': 'flex relative items-center justify-center text-sm rounded-1/2 text-gray-600 w-30px h-30px hover:bg-black/10 focus:bg-black/10',
      '.dropdown': {
        '@apply': 'absolute hidden top-34px right-0 bg-white shadow min-w-120px py-2 rounded z-1 text-left',
        'a': {
          '@apply': 'block px-4 py-1 hover:bg-blue-500 hover:text-white'
        }
      },
      '&:focus .dropdown': {
        '@apply': 'block'
      }
    }
  },
  safelist: 'text-trusted text-redirect text-custom text-suspicious text-unknown',
  plugins: [
    plugin(({ addComponents }) => {
      addComponents({
        '.alert': {
          padding: '0.1rem 1.8rem',
          borderLeft: '0.2rem solid grey',
          '&.alert-warning': {
            borderLeftColor: '#ffa500',
            color: '#ff8c00'
          }
        },
        '.elevated': {
          boxShadow: '0px -15px 15px rgba(0, 0, 0, 0.15)'
        },
        '.loader': {
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #555555',
          borderRadius: '50%',
          width: '20px',
          height: '20px'
        },
        '.tabs': {
          margin: 0,
          padding: '0 0.45rem',
          listStyleType: 'none',
          whiteSpace: 'nowrap',
          overflowX: 'auto',
          borderBottom: '0.5px solid #dcdcdc'
        },
        '.tab': {
          fontSize: '14px',
          display: 'inline-block',
          background: 'transparent',
          padding: '0.5rem 1rem',
          border: 'none',
          borderBottom: '2px solid transparent',
          '&:hover': {
            cursor: 'pointer',
            background: 'rgba(0, 0, 0, 0.05)',
            borderBottomColor: 'rgba(0, 0, 0, 0.05)'
          }
        },
        '.tab.active': {
          color: '#1e90ff',
          borderBottomColor: '#1e90ff',
          pointerEvents: 'none'
        }
      })
    }),
  ]
});