# 🎮 Play Store - Sistema de Gerenciamento

Uma aplicação React moderna para gerenciar o catálogo de itens e inventário de usuários, integrada com microserviços .NET.

## 🚀 Funcionalidades

### 📚 Gerenciamento de Catálogo
- **Criar itens**: Adicionar novos itens com nome, descrição e preço
- **Visualizar itens**: Lista completa de todos os itens do catálogo
- **Editar itens**: Modificar informações existentes através de modal
- **Deletar itens**: Remover itens com confirmação
- **Atualizar lista**: Botão de refresh para sincronizar dados

### 🎒 Gerenciamento de Inventário
- **Buscar inventário**: Consultar itens de um usuário específico por GUID
- **Conceder itens**: Adicionar itens do catálogo ao inventário de um usuário
- **Visualizar quantidade**: Ver quantidade e data de aquisição de cada item
- **Integração automática**: Atualização automática após concessão de itens

## 🏗️ Arquitetura

### Frontend (React + Vite)
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.0
- **Estilização**: CSS moderno com gradientes e animações
- **Responsividade**: Design adaptável para mobile e desktop

### Backend (Microserviços .NET)
- **Play.Catalog.Service** (Porta 5058): Gerenciamento de itens do catálogo
- **Play.Inventory.Service** (Porta 5073): Gerenciamento de inventário de usuários
- **Banco de Dados**: MongoDB
- **Message Broker**: RabbitMQ para eventos de domínio

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Vite, CSS3
- **Backend**: .NET 8, ASP.NET Core, MongoDB
- **Infraestrutura**: Docker, RabbitMQ
- **Padrões**: Microserviços, Event-Driven Architecture

## 📋 Pré-requisitos

- Node.js 18+ e npm
- .NET 8 SDK
- Docker e Docker Compose
- MongoDB (via Docker)
- RabbitMQ (via Docker)

## 🚀 Como Executar

### 1. Iniciar Infraestrutura
```bash
cd ../Play.Infra
docker-compose up -d
```

### 2. Executar Microserviços
```bash
# Terminal 1 - Catalog Service
cd ../Play.Catalog/src/Play.Catalog.Service
dotnet run

# Terminal 2 - Inventory Service  
cd ../Play.Inventory/src/Play.Inventory.Service
dotnet run
```

### 3. Executar Frontend
```bash
# Terminal 3 - Frontend React
npm install
npm run dev
```

### 4. Acessar Aplicação
- **Frontend**: http://localhost:5173
- **Catalog API**: http://localhost:5058
- **Inventory API**: http://localhost:5073
- **MongoDB**: localhost:27017
- **RabbitMQ Management**: http://localhost:15672

## 📱 Como Usar

### Gerenciando Catálogo
1. **Navegue para a aba "Catálogo de Itens"**
2. **Adicionar Item**: Preencha o formulário e clique em "Criar Item"
3. **Editar Item**: Clique no ícone ✏️ e modifique os campos
4. **Deletar Item**: Clique no ícone 🗑️ e confirme a ação
5. **Atualizar**: Use o botão 🔄 para sincronizar dados

### Gerenciando Inventário
1. **Navegue para a aba "Inventário de Usuários"**
2. **Buscar Inventário**: Digite o GUID do usuário e clique em "Buscar"
3. **Conceder Itens**: Selecione usuário, item e quantidade, depois clique em "Conceder Itens"
4. **Visualizar**: Os itens do usuário aparecerão com detalhes de quantidade e data

## 🔧 Configuração

### URLs dos Microserviços
As URLs estão configuradas no arquivo `src/App.jsx`:
```javascript
const CATALOG_API = 'http://localhost:5058'
const INVENTORY_API = 'http://localhost:5073'
```

### Variáveis de Ambiente
Para produção, configure as URLs através de variáveis de ambiente:
```bash
VITE_CATALOG_API_URL=http://your-catalog-service.com
VITE_INVENTORY_API_URL=http://your-inventory-service.com
```

## 📊 Estrutura de Dados

### Item do Catálogo
```json
{
  "id": "guid",
  "name": "Nome do Item",
  "description": "Descrição detalhada",
  "price": 99.99,
  "createdDate": "2024-01-01T00:00:00Z"
}
```

### Item do Inventário
```json
{
  "catalogItemId": "guid",
  "name": "Nome do Item",
  "description": "Descrição do item",
  "quantity": 5,
  "acquiredDate": "2024-01-01T00:00:00Z"
}
```

## 🎨 Design e UX

- **Interface Moderna**: Design com gradientes e efeitos de vidro (glassmorphism)
- **Animações Suaves**: Transições e animações para melhor experiência
- **Responsivo**: Adaptável para todos os tamanhos de tela
- **Feedback Visual**: Loading states, mensagens de erro e confirmações
- **Navegação Intuitiva**: Sistema de abas para organizar funcionalidades

## 🔒 Segurança

- **Validação de Entrada**: Validação client-side para todos os formulários
- **Sanitização**: Dados são sanitizados antes do envio
- **Tratamento de Erros**: Mensagens de erro amigáveis e seguras

## 🚧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Visualizar build
npm run lint     # Executar linter
```

### Estrutura de Arquivos
```
src/
├── App.jsx          # Componente principal
├── App.css          # Estilos da aplicação
└── main.jsx         # Ponto de entrada
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte ou dúvidas:
- Abra uma issue no repositório
- Consulte a documentação da API
- Verifique os logs dos microserviços

## 🔮 Roadmap

- [ ] Autenticação e autorização
- [ ] Histórico de transações
- [ ] Relatórios e analytics
- [ ] Notificações em tempo real
- [ ] API de busca avançada
- [ ] Sistema de categorias
- [ ] Upload de imagens
- [ ] Exportação de dados

---

**Desenvolvido com ❤️ para o sistema Play Store**
