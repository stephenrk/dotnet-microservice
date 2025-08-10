// Utilitários de validação para a aplicação Play Store

/**
 * Valida o nome de um item
 * @param {string} name - Nome do item
 * @returns {object} - Objeto com isValid e message
 */
export const validateItemName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Nome é obrigatório' }
  }
  
  if (name.trim().length < 3) {
    return { isValid: false, message: 'Nome deve ter pelo menos 3 caracteres' }
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, message: 'Nome deve ter no máximo 100 caracteres' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Valida a descrição de um item
 * @param {string} description - Descrição do item
 * @returns {object} - Objeto com isValid e message
 */
export const validateItemDescription = (description) => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, message: 'Descrição é obrigatória' }
  }
  
  if (description.trim().length < 10) {
    return { isValid: false, message: 'Descrição deve ter pelo menos 10 caracteres' }
  }
  
  if (description.trim().length > 500) {
    return { isValid: false, message: 'Descrição deve ter no máximo 500 caracteres' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Valida o preço de um item
 * @param {number|string} price - Preço do item
 * @returns {object} - Objeto com isValid e message
 */
export const validateItemPrice = (price) => {
  const numPrice = parseFloat(price)
  
  if (isNaN(numPrice)) {
    return { isValid: false, message: 'Preço deve ser um número válido' }
  }
  
  if (numPrice < 0) {
    return { isValid: false, message: 'Preço não pode ser negativo' }
  }
  
  if (numPrice > 1000) {
    return { isValid: false, message: 'Preço não pode ser maior que R$ 1000' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Valida a quantidade de itens
 * @param {number|string} quantity - Quantidade
 * @returns {object} - Objeto com isValid e message
 */
export const validateQuantity = (quantity) => {
  const numQuantity = parseInt(quantity)
  
  if (isNaN(numQuantity)) {
    return { isValid: false, message: 'Quantidade deve ser um número válido' }
  }
  
  if (numQuantity < 1) {
    return { isValid: false, message: 'Quantidade deve ser pelo menos 1' }
  }
  
  if (numQuantity > 999) {
    return { isValid: false, message: 'Quantidade não pode ser maior que 999' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Valida um GUID
 * @param {string} guid - GUID a ser validado
 * @returns {object} - Objeto com isValid e message
 */
export const validateGuid = (guid) => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!guid || guid.trim().length === 0) {
    return { isValid: false, message: 'GUID é obrigatório' }
  }
  
  if (!guidRegex.test(guid.trim())) {
    return { isValid: false, message: 'Formato de GUID inválido' }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Valida um item completo do catálogo
 * @param {object} item - Item a ser validado
 * @returns {object} - Objeto com isValid e errors
 */
export const validateCatalogItem = (item) => {
  const errors = {}
  
  const nameValidation = validateItemName(item.name)
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message
  }
  
  const descriptionValidation = validateItemDescription(item.description)
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.message
  }
  
  const priceValidation = validateItemPrice(item.price)
  if (!priceValidation.isValid) {
    errors.price = priceValidation.message
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Valida dados para concessão de itens
 * @param {object} grantData - Dados a serem validados
 * @returns {object} - Objeto com isValid e errors
 */
export const validateGrantItems = (grantData) => {
  const errors = {}
  
  const userIdValidation = validateGuid(grantData.userId)
  if (!userIdValidation.isValid) {
    errors.userId = userIdValidation.message
  }
  
  const catalogItemIdValidation = validateGuid(grantData.catalogItemId)
  if (!catalogItemIdValidation.isValid) {
    errors.catalogItemId = catalogItemIdValidation.message
  }
  
  const quantityValidation = validateQuantity(grantData.quantity)
  if (!quantityValidation.isValid) {
    errors.quantity = quantityValidation.message
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Formata preço para exibição
 * @param {number} price - Preço a ser formatado
 * @returns {string} - Preço formatado
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

/**
 * Formata data para exibição
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} - Data formatada
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Gera um GUID aleatório
 * @returns {string} - GUID gerado
 */
export const generateGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
