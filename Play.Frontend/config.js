// Configurações das APIs para a aplicação Play Store
export const config = {
  // URLs diretas (para uso externo ou quando não usar proxy)
  DIRECT_CATALOG_API_URL: 'http://localhost:5058',
  DIRECT_INVENTORY_API_URL: 'http://localhost:5073',
  
  // Configurações de desenvolvimento
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  
  // Timeout padrão para requisições
  DEFAULT_TIMEOUT: 10000,
  
  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Configurações de cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
}
