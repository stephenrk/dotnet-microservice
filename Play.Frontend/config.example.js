// Configurações da aplicação Play Store
export const config = {
  // URLs dos Microserviços
  CATALOG_API: process.env.VITE_CATALOG_API_URL || 'http://localhost:5058',
  INVENTORY_API: process.env.VITE_INVENTORY_API_URL || 'http://localhost:5073',
  
  // Configurações da Aplicação
  APP_TITLE: process.env.VITE_APP_TITLE || 'Play Store - Sistema de Gerenciamento',
  APP_VERSION: process.env.VITE_APP_VERSION || '1.0.0',
  
  // Configurações de API
  API_TIMEOUT: parseInt(process.env.VITE_API_TIMEOUT) || 10000,
  MAX_RETRIES: parseInt(process.env.VITE_MAX_RETRIES) || 3,
  
  // Configurações de UI
  ITEMS_PER_PAGE: 20,
  AUTO_REFRESH_INTERVAL: 30000, // 30 segundos
  
  // Configurações de Validação
  MIN_ITEM_NAME_LENGTH: 3,
  MAX_ITEM_NAME_LENGTH: 100,
  MIN_ITEM_DESCRIPTION_LENGTH: 10,
  MAX_ITEM_DESCRIPTION_LENGTH: 500,
  MIN_ITEM_PRICE: 0,
  MAX_ITEM_PRICE: 1000,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999
}

// Configurações de desenvolvimento
export const devConfig = {
  ...config,
  DEBUG_MODE: true,
  LOG_LEVEL: 'debug',
  ENABLE_MOCK_DATA: false
}

// Configurações de produção
export const prodConfig = {
  ...config,
  DEBUG_MODE: false,
  LOG_LEVEL: 'error',
  ENABLE_MOCK_DATA: false
}

export default process.env.NODE_ENV === 'production' ? prodConfig : devConfig
