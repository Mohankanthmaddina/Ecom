import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
      },
      '/login': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/register': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/registration-verification': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/forgot-password': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/reset-password': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/resend-otp-submit': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
      },
      // Data-only endpoints that conflict with frontend routes
      '/cart': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/products': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/categories': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/orders': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/user': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
      },
      '/addresses': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
      },
      '/payment': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/buynow': {
        target: 'https://buildersmartenterprices.in',
        changeOrigin: true,
      }
    }
  }
})
