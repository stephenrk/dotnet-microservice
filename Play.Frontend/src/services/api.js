// Serviços de API para a aplicação Play Store

import { config } from "../../config"

// URLs base dos microserviços
const CATALOG_API = config.DIRECT_CATALOG_API_URL
const INVENTORY_API = config.DIRECT_INVENTORY_API_URL

// Configurações padrão para fetch
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.DEFAULT_TIMEOUT,
}

/**
 * Função utilitária para fazer requisições HTTP com timeout
 * @param {string} url - URL da requisição
 * @param {object} options - Opções da requisição
 * @returns {Promise} - Promise com a resposta
 */
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || defaultOptions.timeout)
  
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Requisição expirou')
    }
    throw error
  }
}

/**
 * Serviço para gerenciar itens do catálogo
 */
export const catalogService = {
  /**
   * Busca todos os itens do catálogo
   * @returns {Promise<Array>} - Lista de itens
   */
  async getAllItems() {
    try {
      const response = await fetchWithTimeout(`${CATALOG_API}/items`)
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar itens do catálogo:', error)
      throw new Error('Falha ao buscar itens do catálogo')
    }
  },

  /**
   * Busca um item específico por ID
   * @param {string} id - ID do item
   * @returns {Promise<object>} - Item encontrado
   */
  async getItemById(id) {
    try {
      const response = await fetchWithTimeout(`${CATALOG_API}/items/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Item não encontrado')
        }
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar item:', error)
      throw error
    }
  },

  /**
   * Cria um novo item no catálogo
   * @param {object} item - Dados do item
   * @returns {Promise<object>} - Item criado
   */
  async createItem(item) {
    try {
      const response = await fetchWithTimeout(`${CATALOG_API}/items`, {
        method: 'POST',
        body: JSON.stringify(item),
      })
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Erro ao criar item:', error)
      throw new Error('Falha ao criar item')
    }
  },

  /**
   * Atualiza um item existente
   * @param {string} id - ID do item
   * @param {object} item - Novos dados do item
   * @returns {Promise<object>} - Item atualizado
   */
  async updateItem(id, item) {
    try {
      const response = await fetchWithTimeout(`${CATALOG_API}/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
      })
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Item não encontrado')
        }
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
      throw error
    }
  },

  /**
   * Deleta um item do catálogo
   * @param {string} id - ID do item
   * @returns {Promise<void>}
   */
  async deleteItem(id) {
    try {
      const response = await fetchWithTimeout(`${CATALOG_API}/items/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Item não encontrado')
        }
        throw new Error(`Erro HTTP: ${response.status}`)
      }
    } catch (error) {
      console.error('Erro ao deletar item:', error)
      throw error
    }
  },
}

/**
 * Serviço para gerenciar inventário de usuários
 */
export const inventoryService = {
  /**
   * Busca o inventário de um usuário específico
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} - Lista de itens do inventário
   */
  async getUserInventory(userId) {
    try {
      const response = await fetchWithTimeout(`${INVENTORY_API}/items?userId=${userId}`)
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar inventário:', error)
      throw new Error('Falha ao buscar inventário do usuário')
    }
  },

  /**
   * Concede itens a um usuário
   * @param {object} grantData - Dados da concessão
   * @returns {Promise<void>}
   */
  async grantItems(grantData) {
    try {
      const response = await fetchWithTimeout(`${INVENTORY_API}/items`, {
        method: 'POST',
        body: JSON.stringify(grantData),
      })
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
    } catch (error) {
      console.error('Erro ao conceder itens:', error)
      throw new Error('Falha ao conceder itens ao usuário')
    }
  },
}

/**
 * Serviço para gerenciar erros e retry
 */
export const errorService = {
  /**
   * Executa uma função com retry automático
   * @param {Function} fn - Função a ser executada
   * @param {number} maxRetries - Número máximo de tentativas
   * @param {number} delay - Delay entre tentativas em ms
   * @returns {Promise} - Resultado da função
   */
  async withRetry(fn, maxRetries = config.MAX_RETRIES, delay = config.RETRY_DELAY) {
    let lastError
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        console.warn(`Tentativa ${attempt} falhou:`, error.message)
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }
    
    throw lastError
  },

  /**
   * Verifica se um erro é recuperável
   * @param {Error} error - Erro a ser verificado
   * @returns {boolean} - Se o erro é recuperável
   */
  isRecoverableError(error) {
    const recoverableStatuses = [408, 429, 500, 502, 503, 504]
    return error.message.includes('HTTP') && 
           recoverableStatuses.some(status => error.message.includes(status.toString()))
  },
}

/**
 * Serviço para cache local
 */
export const cacheService = {
  cache: new Map(),
  
  /**
   * Armazena um valor no cache
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em ms
   */
  set(key, value, ttl = config.CACHE_TTL) { // TTL configurável
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  },

  /**
   * Recupera um valor do cache
   * @param {string} key - Chave do cache
   * @returns {any} - Valor armazenado ou null se expirado
   */
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  },

  /**
   * Remove um item do cache
   * @param {string} key - Chave do cache
   */
  delete(key) {
    this.cache.delete(key)
  },

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear()
  }
}

export default {
  catalog: catalogService,
  inventory: inventoryService,
  error: errorService,
  cache: cacheService
}
