# 🔧 Resolução de Problemas de CORS

## ❌ Problema Identificado
Você está recebendo erros de CORS mesmo usando HTTP. Isso pode acontecer por várias razões.

## ✅ Soluções Implementadas

### 1. **Proxy de Desenvolvimento no Vite (RECOMENDADO)**
- Configurado proxy no `vite.config.js`
- Todas as requisições passam pelo servidor de desenvolvimento
- Elimina completamente o problema de CORS

### 2. **Configuração de URLs**
```javascript
// config.js
export const config = {
  // URLs via proxy (sem CORS)
  CATALOG_API_URL: '/api/catalog',
  INVENTORY_API_URL: '/api/inventory',
  
  // URLs diretas (para referência)
  DIRECT_CATALOG_API_URL: 'http://localhost:5058',
  DIRECT_INVENTORY_API_URL: 'http://localhost:5073',
}
```

### 3. **Proxy Configurado**
```javascript
// vite.config.js
server: {
  proxy: {
    '/api/catalog': {
      target: 'http://localhost:5058',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/catalog/, ''),
    },
    '/api/inventory': {
      target: 'http://localhost:5073',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/inventory/, ''),
    },
  },
}
```

## 🚀 Como Usar

### **Opção 1: Proxy do Vite (Recomendado)**
1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. As APIs agora funcionam via:
   - `/api/catalog/items` → `http://localhost:5058/items`
   - `/api/inventory/items` → `http://localhost:5073/items`

### **Opção 2: Variáveis de Ambiente**
Crie um arquivo `.env` na raiz:
```bash
VITE_CATALOG_API_URL=http://localhost:5058
VITE_INVENTORY_API_URL=http://localhost:5073
```

### **Opção 3: Configurar CORS no Backend**
Se você precisar usar URLs diretas, configure CORS no ASP.NET Core:
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowAll");
```

## 🔍 Teste das APIs

### **Arquivo de Teste**
Use o arquivo `test-apis.html` para testar:
1. Abra `test-apis.html` no navegador
2. Teste as APIs diretas (pode dar CORS)
3. Teste as APIs via proxy (deve funcionar)

### **Verificação Manual**
1. **Teste direto (pode dar CORS):**
   - http://localhost:5058/items
   - http://localhost:5073/items

2. **Teste via proxy (deve funcionar):**
   - http://localhost:5173/api/catalog/items
   - http://localhost:5173/api/inventory/items

## 📝 Por que o CORS Acontece

### **CORS em Desenvolvimento:**
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5058
- **Problema:** Mesmo domínio, portas diferentes = CORS

### **Soluções:**
1. **Proxy (Recomendado):** Todas as requisições vêm do mesmo domínio
2. **CORS no Backend:** Backend aceita requisições de qualquer origem
3. **Mesma Porta:** Frontend e backend na mesma porta

## 🆘 Solução de Problemas

### **Se o proxy não funcionar:**
1. Verifique se o `vite.config.js` está correto
2. Reinicie o servidor de desenvolvimento
3. Verifique se as APIs estão rodando nas portas corretas

### **Se ainda houver CORS:**
1. Use o arquivo de teste para diagnosticar
2. Verifique o console do navegador
3. Confirme que as APIs estão online

### **Para produção:**
1. Configure CORS adequadamente no backend
2. Use HTTPS com certificados válidos
3. Configure origens permitidas específicas

## 🎯 Resumo

- **Proxy do Vite:** ✅ Solução mais simples e confiável
- **CORS no Backend:** ✅ Solução para produção
- **Mesma Porta:** ⚠️ Pode ser complexo de configurar

**Recomendação:** Use o proxy do Vite para desenvolvimento e configure CORS adequadamente para produção.
