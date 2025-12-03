const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DADOS_FILE = path.join(__dirname, 'dados.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Função para ler dados com tratamento de erro
function lerDados() {
  try {
    if (!fs.existsSync(DADOS_FILE)) {
      console.warn('Arquivo dados.json não encontrado, criando novo...');
      const dadosPadrao = {
        produtos: [],
        pedidos: []
      };
      salvarDados(dadosPadrao);
      return dadosPadrao;
    }

    const conteudo = fs.readFileSync(DADOS_FILE, 'utf8');
    const dados = JSON.parse(conteudo);
    
    // Validar estrutura
    if (!dados.produtos || !Array.isArray(dados.produtos)) {
      dados.produtos = [];
    }
    if (!dados.pedidos || !Array.isArray(dados.pedidos)) {
      dados.pedidos = [];
    }
    
    return dados;
  } catch (erro) {
    console.error('Erro ao ler dados:', erro);
    return { produtos: [], pedidos: [] };
  }
}

// Função para salvar dados com tratamento de erro
function salvarDados(dados) {
  try {
    // Validar dados antes de salvar
    if (!dados.produtos) dados.produtos = [];
    if (!dados.pedidos) dados.pedidos = [];

    fs.writeFileSync(DADOS_FILE, JSON.stringify(dados, null, 2), 'utf8');
    return true;
  } catch (erro) {
    console.error('Erro ao salvar dados:', erro);
    return false;
  }
}

// Validar produto
function validarProduto(produto) {
  if (!produto || typeof produto !== 'object') {
    return { valido: false, erro: 'Produto inválido' };
  }

  if (!produto.id || typeof produto.id !== 'number') {
    return { valido: false, erro: 'ID do produto inválido' };
  }

  if (!produto.nome || typeof produto.nome !== 'string' || produto.nome.trim() === '') {
    return { valido: false, erro: 'Nome do produto inválido' };
  }

  if (typeof produto.preco !== 'number' || produto.preco < 0) {
    return { valido: false, erro: 'Preço do produto inválido' };
  }

  return { valido: true };
}

// Validar pedido
function validarPedido(pedido) {
  if (!pedido || typeof pedido !== 'object') {
    return { valido: false, erro: 'Pedido inválido' };
  }

  if (!pedido.cliente || typeof pedido.cliente !== 'string' || pedido.cliente.trim() === '') {
    return { valido: false, erro: 'Nome do cliente é obrigatório' };
  }

  if (!Array.isArray(pedido.items) || pedido.items.length === 0) {
    return { valido: false, erro: 'Pedido deve ter pelo menos um item' };
  }

  if (typeof pedido.total !== 'number' || pedido.total <= 0) {
    return { valido: false, erro: 'Total do pedido inválido' };
  }

  // Validar email se fornecido
  if (pedido.email && pedido.email.trim() !== '') {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(pedido.email)) {
      return { valido: false, erro: 'Email inválido' };
    }
  }

  return { valido: true };
}

// Rota para listar todos os produtos
app.get('/api/produtos', (req, res) => {
  try {
    const dados = lerDados();
    res.json(dados.produtos);
  } catch (erro) {
    console.error('Erro ao listar produtos:', erro);
    res.status(500).json({ erro: 'Erro ao listar produtos' });
  }
});

// Rota para buscar um produto por ID
app.get('/api/produtos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const dados = lerDados();
    const produto = dados.produtos.find(p => p.id === id);

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json(produto);
  } catch (erro) {
    console.error('Erro ao buscar produto:', erro);
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
});

// Rota para criar um novo produto (admin)
app.post('/api/produtos', (req, res) => {
  try {
    const novoProduto = req.body;

    const validacao = validarProduto(novoProduto);
    if (!validacao.valido) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const dados = lerDados();

    // Verificar se ID já existe
    if (dados.produtos.find(p => p.id === novoProduto.id)) {
      return res.status(400).json({ erro: 'Produto com este ID já existe' });
    }

    dados.produtos.push(novoProduto);

    if (salvarDados(dados)) {
      res.status(201).json({ sucesso: true, produto: novoProduto });
    } else {
      res.status(500).json({ erro: 'Erro ao salvar produto' });
    }
  } catch (erro) {
    console.error('Erro ao criar produto:', erro);
    res.status(500).json({ erro: 'Erro ao criar produto' });
  }
});

// Rota para atualizar um produto (admin)
app.put('/api/produtos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const produtoAtualizado = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const validacao = validarProduto(produtoAtualizado);
    if (!validacao.valido) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const dados = lerDados();
    const indice = dados.produtos.findIndex(p => p.id === id);

    if (indice === -1) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    dados.produtos[indice] = { ...dados.produtos[indice], ...produtoAtualizado };

    if (salvarDados(dados)) {
      res.json({ sucesso: true, produto: dados.produtos[indice] });
    } else {
      res.status(500).json({ erro: 'Erro ao atualizar produto' });
    }
  } catch (erro) {
    console.error('Erro ao atualizar produto:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

// Rota para deletar um produto (admin)
app.delete('/api/produtos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const dados = lerDados();
    const indice = dados.produtos.findIndex(p => p.id === id);

    if (indice === -1) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    const produtoRemovido = dados.produtos.splice(indice, 1);

    if (salvarDados(dados)) {
      res.json({ sucesso: true, mensagem: 'Produto removido com sucesso', produto: produtoRemovido[0] });
    } else {
      res.status(500).json({ erro: 'Erro ao remover produto' });
    }
  } catch (erro) {
    console.error('Erro ao deletar produto:', erro);
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
});

// Rota para criar um pedido
app.post('/api/pedidos', (req, res) => {
  try {
    const pedidoRecebido = req.body;

    const validacao = validarPedido(pedidoRecebido);
    if (!validacao.valido) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const dados = lerDados();

    const novoPedido = {
      id: dados.pedidos.length > 0 ? Math.max(...dados.pedidos.map(p => p.id)) + 1 : 1,
      cliente: pedidoRecebido.cliente.trim(),
      email: pedidoRecebido.email ? pedidoRecebido.email.trim() : '',
      telefone: pedidoRecebido.telefone ? pedidoRecebido.telefone.trim() : '',
      items: pedidoRecebido.items,
      total: pedidoRecebido.total,
      observacoes: pedidoRecebido.observacoes ? pedidoRecebido.observacoes.trim() : '',
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR'),
      status: 'pendente',
      dataCriacao: new Date().toISOString()
    };

    dados.pedidos.push(novoPedido);

    if (salvarDados(dados)) {
      res.status(201).json({ sucesso: true, pedido: novoPedido });
    } else {
      res.status(500).json({ erro: 'Erro ao salvar pedido' });
    }
  } catch (erro) {
    console.error('Erro ao criar pedido:', erro);
    res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
});

// Rota para listar pedidos
app.get('/api/pedidos', (req, res) => {
  try {
    const dados = lerDados();
    const pedidosOrdenados = dados.pedidos.sort((a, b) => {
      return new Date(b.dataCriacao) - new Date(a.dataCriacao);
    });
    res.json(pedidosOrdenados);
  } catch (erro) {
    console.error('Erro ao listar pedidos:', erro);
    res.status(500).json({ erro: 'Erro ao listar pedidos' });
  }
});

// Rota para buscar um pedido por ID
app.get('/api/pedidos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const dados = lerDados();
    const pedido = dados.pedidos.find(p => p.id === id);

    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    res.json(pedido);
  } catch (erro) {
    console.error('Erro ao buscar pedido:', erro);
    res.status(500).json({ erro: 'Erro ao buscar pedido' });
  }
});

// Rota para atualizar status de um pedido (admin)
app.put('/api/pedidos/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const statusValidos = ['pendente', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado'];
    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido' });
    }

    const dados = lerDados();
    const pedido = dados.pedidos.find(p => p.id === id);

    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    pedido.status = status;
    pedido.dataAtualizacao = new Date().toISOString();

    if (salvarDados(dados)) {
      res.json({ sucesso: true, pedido });
    } else {
      res.status(500).json({ erro: 'Erro ao atualizar pedido' });
    }
  } catch (erro) {
    console.error('Erro ao atualizar pedido:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar pedido' });
  }
});

// Rota para deletar um pedido (admin)
app.delete('/api/pedidos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const dados = lerDados();
    const indice = dados.pedidos.findIndex(p => p.id === id);

    if (indice === -1) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    const pedidoRemovido = dados.pedidos.splice(indice, 1);

    if (salvarDados(dados)) {
      res.json({ sucesso: true, mensagem: 'Pedido removido com sucesso', pedido: pedidoRemovido[0] });
    } else {
      res.status(500).json({ erro: 'Erro ao remover pedido' });
    }
  } catch (erro) {
    console.error('Erro ao deletar pedido:', erro);
    res.status(500).json({ erro: 'Erro ao deletar pedido' });
  }
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento de erro geral
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📱 Abra seu navegador e acesse: http://localhost:${PORT}`);
  console.log(`\n📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`💾 Dados salvos em: ${DADOS_FILE}\n`);
});

// Tratamento de erro não capturado
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
  process.exit(1);
});
