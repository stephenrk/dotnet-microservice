import { useState, useEffect } from 'react'
import './App.css'
import { catalogService, inventoryService, errorService, cacheService } from './services/api'
import { validateCatalogItem, validateGrantItems } from './utils/validation'

// Componente principal da aplicação
function App() {
  const [activeTab, setActiveTab] = useState('catalog')
  const [catalogItems, setCatalogItems] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Estados para formulários
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' })
  const [editingItem, setEditingItem] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [grantItems, setGrantItems] = useState({ userId: '', catalogItemId: '', quantity: 1 })
  
  // Estados para validação
  const [newItemErrors, setNewItemErrors] = useState({})
  const [editingItemErrors, setEditingItemErrors] = useState({})
  const [grantItemsErrors, setGrantItemsErrors] = useState({})

  // Buscar itens do catálogo usando o serviço centralizado
  const fetchCatalogItems = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Verificar cache primeiro
      const cachedItems = cacheService.get('catalog-items')
      if (cachedItems) {
        setCatalogItems(cachedItems)
        setLoading(false)
        return
      }
      
      // Usar o serviço com retry automático
      const data = await errorService.withRetry(() => catalogService.getAllItems())
      
      // Armazenar no cache
      cacheService.set('catalog-items', data)
      setCatalogItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Buscar inventário de um usuário usando o serviço centralizado
  const fetchUserInventory = async (userId) => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError('')
      
      // Verificar cache primeiro
      const cacheKey = `inventory-${userId}`
      const cachedInventory = cacheService.get(cacheKey)
      if (cachedInventory) {
        setInventoryItems(cachedInventory)
        setLoading(false)
        return
      }
      
      // Usar o serviço com retry automático
      const data = await errorService.withRetry(() => inventoryService.getUserInventory(userId))
      
      // Armazenar no cache
      cacheService.set(cacheKey, data)
      setInventoryItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Criar novo item no catálogo usando o serviço centralizado
  const createCatalogItem = async (e) => {
    e.preventDefault()
    
    // Validar formulário antes de enviar
    if (!validateNewItem()) {
      return
    }
    
    try {
      setLoading(true)
      setError('')
      clearValidationErrors()
      
      // Usar o serviço com retry automático
      await errorService.withRetry(() => catalogService.createItem(newItem))
      
      // Limpar formulário e atualizar lista
      setNewItem({ name: '', description: '', price: '' })
      
      // Invalidar cache e buscar dados atualizados
      cacheService.delete('catalog-items')
      await fetchCatalogItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar item do catálogo usando o serviço centralizado
  const updateCatalogItem = async (e) => {
    e.preventDefault()
    
    // Validar formulário antes de enviar
    if (!validateEditingItem()) {
      return
    }
    
    try {
      setLoading(true)
      setError('')
      clearValidationErrors()
      
      // Usar o serviço com retry automático
      await errorService.withRetry(() => 
        catalogService.updateItem(editingItem.id, {
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price
        })
      )
      
      // Fechar modal e atualizar lista
      setEditingItem(null)
      
      // Invalidar cache e buscar dados atualizados
      cacheService.delete('catalog-items')
      await fetchCatalogItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Deletar item do catálogo usando o serviço centralizado
  const deleteCatalogItem = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return
    
    try {
      setLoading(true)
      setError('')
      
      // Usar o serviço com retry automático
      await errorService.withRetry(() => catalogService.deleteItem(id))
      
      // Invalidar cache e buscar dados atualizados
      cacheService.delete('catalog-items')
      await fetchCatalogItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Conceder itens a um usuário usando o serviço centralizado
  const grantItemsToUser = async (e) => {
    e.preventDefault()
    
    // Validar formulário antes de enviar
    if (!validateGrantItemsForm()) {
      return
    }
    
    try {
      setLoading(true)
      setError('')
      clearValidationErrors()
      
      // Usar o serviço com retry automático
      await errorService.withRetry(() => inventoryService.grantItems(grantItems))
      
      // Limpar formulário
      setGrantItems({ userId: '', catalogItemId: '', quantity: 1 })
      
      // Se há um usuário selecionado, atualizar seu inventário
      if (selectedUserId) {
        // Invalidar cache do inventário deste usuário
        cacheService.delete(`inventory-${selectedUserId}`)
        await fetchUserInventory(selectedUserId)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Função para limpar cache e forçar atualização
  const refreshData = async () => {
    cacheService.clear()
    if (activeTab === 'catalog') {
      await fetchCatalogItems()
    } else if (activeTab === 'inventory' && selectedUserId) {
      await fetchUserInventory(selectedUserId)
    }
  }

  // Funções de validação
  const validateNewItem = () => {
    const validation = validateCatalogItem(newItem)
    setNewItemErrors(validation.errors)
    return validation.isValid
  }

  const validateEditingItem = () => {
    const validation = validateCatalogItem(editingItem)
    setEditingItemErrors(validation.errors)
    return validation.isValid
  }

  const validateGrantItemsForm = () => {
    const validation = validateGrantItems(grantItems)
    setGrantItemsErrors(validation.errors)
    return validation.isValid
  }

  // Limpar erros de validação
  const clearValidationErrors = () => {
    setNewItemErrors({})
    setEditingItemErrors({})
    setGrantItemsErrors({})
  }

  // Carregar dados iniciais
  useEffect(() => {
    fetchCatalogItems()
  }, [])

  // Limpar erro após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 Play Store - Gerenciamento</h1>
        <p>Sistema de Catálogo e Inventário</p>
      </header>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <nav className="tab-navigation">
        <button 
          className={activeTab === 'catalog' ? 'active' : ''}
          onClick={() => setActiveTab('catalog')}
        >
          📚 Catálogo de Itens
        </button>
        <button 
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => setActiveTab('inventory')}
        >
          🎒 Inventário de Usuários
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'catalog' && (
          <div className="catalog-section">
            <div className="section-header">
              <h2>Gerenciar Catálogo de Itens</h2>
              <button 
                className="refresh-btn"
                onClick={refreshData}
                disabled={loading}
              >
                🔄 Atualizar
              </button>
            </div>

            {/* Formulário para criar novo item */}
            <div className="form-card">
              <h3>➕ Adicionar Novo Item</h3>
              <form onSubmit={createCatalogItem}>
                <div className="form-group">
                  <label>Nome:</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Nome do item"
                    required
                    className={newItemErrors.name ? 'error' : ''}
                  />
                  {newItemErrors.name && <span className="error-message">{newItemErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Descrição:</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Descrição do item"
                    required
                    className={newItemErrors.description ? 'error' : ''}
                  />
                  {newItemErrors.description && <span className="error-message">{newItemErrors.description}</span>}
                </div>
                <div className="form-group">
                  <label>Preço:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1000"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    placeholder="0.00"
                    required
                    className={newItemErrors.price ? 'error' : ''}
                  />
                  {newItemErrors.price && <span className="error-message">{newItemErrors.price}</span>}
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Item'}
                </button>
              </form>
            </div>

            {/* Lista de itens do catálogo */}
            <div className="items-grid">
              {catalogItems.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h4>{item.name}</h4>
                    <div className="item-actions">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="edit-btn"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteCatalogItem(item.id)}
                        className="delete-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <div className="item-price">💰 R$ {item.price}</div>
                  <div className="item-date">
                    Criado em: {new Date(item.createdDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de edição */}
            {editingItem && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>✏️ Editar Item</h3>
                  <form onSubmit={updateCatalogItem}>
                    <div className="form-group">
                      <label>Nome:</label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        required
                        className={editingItemErrors.name ? 'error' : ''}
                      />
                      {editingItemErrors.name && <span className="error-message">{editingItemErrors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Descrição:</label>
                      <textarea
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                        required
                        className={editingItemErrors.description ? 'error' : ''}
                      />
                      {editingItemErrors.description && <span className="error-message">{editingItemErrors.description}</span>}
                    </div>
                    <div className="form-group">
                      <label>Preço:</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1000"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                        required
                        className={editingItemErrors.price ? 'error' : ''}
                      />
                      {editingItemErrors.price && <span className="error-message">{editingItemErrors.price}</span>}
                    </div>
                    <div className="modal-actions">
                      <button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingItem(null)}
                        className="cancel-btn"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <div className="section-header">
              <h2>Gerenciar Inventário de Usuários</h2>
            </div>

            {/* Buscar inventário por usuário */}
            <div className="form-card">
              <h3>🔍 Buscar Inventário</h3>
              <div className="search-form">
                <div className="form-group">
                  <label>ID do Usuário:</label>
                  <input
                    type="text"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    placeholder="Digite o GUID do usuário"
                  />
                </div>
                <button 
                  onClick={() => fetchUserInventory(selectedUserId)}
                  disabled={!selectedUserId || loading}
                >
                  {loading ? 'Buscando...' : '🔍 Buscar'}
                </button>
              </div>
            </div>

            {/* Conceder itens a um usuário */}
            <div className="form-card">
              <h3>🎁 Conceder Itens</h3>
              <form onSubmit={grantItemsToUser}>
                <div className="form-group">
                  <label>ID do Usuário:</label>
                  <input
                    type="text"
                    value={grantItems.userId}
                    onChange={(e) => setGrantItems({...grantItems, userId: e.target.value})}
                    placeholder="GUID do usuário"
                    required
                    className={grantItemsErrors.userId ? 'error' : ''}
                  />
                  {grantItemsErrors.userId && <span className="error-message">{grantItemsErrors.userId}</span>}
                </div>
                <div className="form-group">
                  <label>Item do Catálogo:</label>
                  <select
                    value={grantItems.catalogItemId}
                    onChange={(e) => setGrantItems({...grantItems, catalogItemId: e.target.value})}
                    required
                    className={grantItemsErrors.catalogItemId ? 'error' : ''}
                  >
                    <option value="">Selecione um item</option>
                    {catalogItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - R$ {item.price}
                      </option>
                    ))}
                  </select>
                  {grantItemsErrors.catalogItemId && <span className="error-message">{grantItemsErrors.catalogItemId}</span>}
                </div>
                <div className="form-group">
                  <label>Quantidade:</label>
                  <input
                    type="number"
                    min="1"
                    value={grantItems.quantity}
                    onChange={(e) => setGrantItems({...grantItems, quantity: parseInt(e.target.value)})}
                    required
                    className={grantItemsErrors.quantity ? 'error' : ''}
                  />
                  {grantItemsErrors.quantity && <span className="error-message">{grantItemsErrors.quantity}</span>}
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Concedendo...' : '🎁 Conceder Itens'}
                </button>
              </form>
            </div>

            {/* Lista de itens do inventário */}
            {selectedUserId && (
              <div className="inventory-items">
                <h3>📦 Inventário do Usuário: {selectedUserId}</h3>
                {inventoryItems.length === 0 ? (
                  <p className="no-items">Nenhum item encontrado no inventário deste usuário.</p>
                ) : (
                  <div className="inventory-grid">
                    {inventoryItems.map(item => (
                      <div key={item.catalogItemId} className="inventory-item-card">
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <div className="inventory-details">
                          <span className="quantity">📦 Quantidade: {item.quantity}</span>
                          <span className="acquired-date">
                            Adquirido em: {new Date(item.acquiredDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">⏳</div>
          <p>Carregando...</p>
        </div>
      )}
    </div>
  )
}

export default App
