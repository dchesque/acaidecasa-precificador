/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },
  // Configurações para evitar problemas de permissão no Windows
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    // Evita problemas com cache e watching no Windows
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    }
    
    return config
  },
  // Define diretório customizado para build se necessário
  distDir: '.next',
  // Desabilita o source maps em desenvolvimento para evitar arquivos de trace
  productionBrowserSourceMaps: false,
  // Desabilita o cabeçalho "X-Powered-By"
  poweredByHeader: false,
}

export default nextConfig