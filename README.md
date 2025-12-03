# Loja de Produtos Naturais - Versão Simples

Um site de e-commerce simples para venda de produtos naturais e a granel.

## Tecnologias Usadas

- **HTML5** - Estrutura
- **CSS3** - Estilização
- **JavaScript** - Interatividade
- **Node.js** - Servidor
- **Express** - Framework web

## Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar o Servidor

```bash
npm start
```

Ou para modo desenvolvimento:

```bash
npm run dev
```

### 3. Abrir no Navegador

Acesse: `http://localhost:3000`

## Estrutura do Projeto

```
loja-naturais-simples/
├── public/
│   ├── index.html      # Página principal
│   ├── style.css       # Estilos
│   └── script.js       # JavaScript
├── server.js           # Servidor Node.js
├── dados.json          # Banco de dados (JSON)
├── package.json        # Dependências
└── README.md          # Este arquivo
```

## Funcionalidades

✅ Catálogo de produtos com 12 itens  
✅ Filtro por categoria  
✅ Busca de produtos  
✅ Carrinho de compras  
✅ Checkout com formulário  
✅ Salvar pedidos em JSON  
✅ Design responsivo (mobile)  
✅ Interface simples e intuitiva  

## Produtos Disponíveis

- **Cereais**: Arroz, Feijão, Lentilha
- **Frutas Secas**: Damasco, Tâmara, Uva Passa
- **Oleaginosas**: Castanha de Caju, Amêndoas
- **Farinhas**: Trigo Integral, Aveia
- **Temperos**: Cúrcuma
- **Chás**: Chá Verde

## APIs Disponíveis

### Listar Produtos
```
GET /api/produtos
```

### Buscar Produto por ID
```
GET /api/produtos/:id
```

### Criar Pedido
```
POST /api/pedidos
```

Exemplo de dados:
```json
{
  "cliente": "João Silva",
  "email": "joao@email.com",
  "telefone": "(47) 99999-9999",
  "items": [
    {
      "id": 1,
      "nome": "Arroz Integral",
      "preco": 18.90,
      "quantidade": 2
    }
  ],
  "total": 37.80
}
```

### Listar Pedidos
```
GET /api/pedidos
```

## Personalizações

### Adicionar Novo Produto

Edite o arquivo `dados.json` e adicione um novo item no array `produtos`:

```json
{
  "id": 13,
  "nome": "Seu Produto",
  "preco": 29.90,
  "categoria": "Sua Categoria",
  "descricao": "Descrição do produto",
  "imagem": "🎯"
}
```

### Mudar Cores

Edite `public/style.css`:
- `#1a3a52` - Azul escuro
- `#ff6b35` - Laranja

### Adicionar Categorias

Adicione novos botões na navegação em `public/index.html` e chame a função `filtrarPorCategoria()`.

## Notas

- Os dados são salvos em `dados.json`
- Não há banco de dados real (apenas JSON)
- Sem autenticação de usuários
- Sem sistema de pagamento integrado

## Licença

Livre para usar e modificar.
