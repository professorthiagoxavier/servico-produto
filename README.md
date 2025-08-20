# API de Produtos - Serviço REST

Este projeto implementa uma API REST para gerenciamento de produtos utilizando Node.js, Express e MongoDB.

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [Docker](https://www.docker.com/) (para rodar o MongoDB)
- [Git](https://git-scm.com/) (para clonar o repositório)

## 🚀 Configuração do Projeto

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd servico-produto
```

### 2. Instalar Dependências

```bash
cd api-produto
npm install
```

### 3. Configurar o MongoDB com Docker

Execute o seguinte comando para subir o MongoDB em um container Docker:

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=seu_usuario \
  -e MONGO_INITDB_ROOT_PASSWORD=sua_senha \
  -v mongodb_data:/data/db \
  mongo:latest
```

**Explicação dos parâmetros:**
- `-d`: Executa o container em modo detached (background)
- `--name mongodb`: Nome do container
- `-p 27017:27017`: Mapeia a porta 27017 do host para a porta 27017 do container
- `-e MONGO_INITDB_ROOT_USERNAME=seu_usuario`: Define o usuário root
- `-e MONGO_INITDB_ROOT_PASSWORD=sua_senha`: Define a senha do usuário root
- `-v mongodb_data:/data/db`: Cria um volume para persistir os dados
- `mongo:latest`: Imagem do MongoDB

### 4. Verificar se o MongoDB está Rodando

```bash
docker ps
```

Você deve ver o container `mongodb` na lista de containers ativos.

### 5. Configurar a Conexão

A conexão com o MongoDB já está configurada no arquivo `src/app.js`:

```javascript
mongoose.connect("mongodb://seu_usuario:sua_senha@localhost:27017/?authSource=admin");
```

**Importante:** 
- Substitua `seu_usuario` e `sua_senha` pelos valores que você definiu no comando Docker
- O parâmetro `authSource=admin` é necessário para usuários root do MongoDB

### 6. Executar a Aplicação

```bash
npm start
```

Ou se preferir usar o nodemon para desenvolvimento:

```bash
npm run dev
```

A API estará disponível em: `http://localhost:3000`

## 📚 Estrutura do Projeto

```
api-produto/
├── src/
│   ├── app.js                 # Configuração principal da aplicação
│   ├── controllers/           # Controladores da API
│   │   └── product-controller.js
│   ├── models/               # Modelos do MongoDB
│   │   └── product.js
│   ├── repositories/         # Camada de acesso a dados
│   │   └── product-repository.js
│   └── routes/              # Rotas da API
│       ├── index.js
│       └── product-route.js
├── bin/
│   └── server.js            # Servidor HTTP
└── package.json
```

## 🏗️ Criando os Componentes da Arquitetura

### 1. Model (Modelo)

O Model define a estrutura dos dados no MongoDB usando Mongoose.

**Arquivo:** `src/models/product.js`

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Product', productSchema);
```

### 2. Repository (Repositório)

O Repository é responsável pela camada de acesso a dados, isolando a lógica de banco de dados.

**Arquivo:** `src/repositories/product-repository.js`

```javascript
const Product = require('../models/product');

class ProductRepository {
    async findAll() {
        return await Product.find({ active: true });
    }

    async findById(id) {
        return await Product.findById(id);
    }

    async create(productData) {
        const product = new Product(productData);
        return await product.save();
    }

    async update(id, productData) {
        return await Product.findByIdAndUpdate(
            id, 
            productData, 
            { new: true, runValidators: true }
        );
    }

    async delete(id) {
        return await Product.findByIdAndUpdate(
            id, 
            { active: false }, 
            { new: true }
        );
    }

    async findByCategory(category) {
        return await Product.find({ 
            category: category, 
            active: true 
        });
    }
}

module.exports = new ProductRepository();
```

### 3. Controller (Controlador)

O Controller gerencia as requisições HTTP e respostas, contendo a lógica de negócio.

**Arquivo:** `src/controllers/product-controller.js`

```javascript
const ProductRepository = require('../repositories/product-repository');

class ProductController {
    async getAllProducts(req, res) {
        try {
            const products = await ProductRepository.findAll();
            res.status(200).json({
                success: true,
                data: products,
                message: 'Produtos listados com sucesso'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao listar produtos',
                error: error.message
            });
        }
    }

    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductRepository.findById(id);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: product,
                message: 'Produto encontrado com sucesso'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar produto',
                error: error.message
            });
        }
    }

    async createProduct(req, res) {
        try {
            const productData = req.body;
            const newProduct = await ProductRepository.create(productData);
            
            res.status(201).json({
                success: true,
                data: newProduct,
                message: 'Produto criado com sucesso'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erro ao criar produto',
                error: error.message
            });
        }
    }

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const productData = req.body;
            
            const updatedProduct = await ProductRepository.update(id, productData);
            
            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: updatedProduct,
                message: 'Produto atualizado com sucesso'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erro ao atualizar produto',
                error: error.message
            });
        }
    }

    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const deletedProduct = await ProductRepository.delete(id);
            
            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Produto removido com sucesso'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao remover produto',
                error: error.message
            });
        }
    }

    async getProductsByCategory(req, res) {
        try {
            const { category } = req.params;
            const products = await ProductRepository.findByCategory(category);
            
            res.status(200).json({
                success: true,
                data: products,
                message: `Produtos da categoria ${category} listados com sucesso`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao listar produtos por categoria',
                error: error.message
            });
        }
    }
}

module.exports = new ProductController();
```

### 4. Route (Rota)

As Routes definem os endpoints da API e conectam as requisições aos controllers.

**Arquivo:** `src/routes/product-route.js`

```javascript
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product-controller');

// Middleware para validação básica
const validateProduct = (req, res, next) => {
    const { name, description, price, category } = req.body;
    
    if (!name || !description || !price || !category) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos obrigatórios devem ser preenchidos'
        });
    }
    
    if (price <= 0) {
        return res.status(400).json({
            success: false,
            message: 'O preço deve ser maior que zero'
        });
    }
    
    next();
};

// Rotas para produtos
router.get('/', ProductController.getAllProducts);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/:id', ProductController.getProductById);
router.post('/', validateProduct, ProductController.createProduct);
router.put('/:id', validateProduct, ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
```

### 5. Registrando as Rotas

**Arquivo:** `src/routes/index.js`

```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'API de Produtos funcionando!',
        version: '1.0.0',
        endpoints: {
            products: '/products',
            health: '/health'
        }
    });
});

router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
```

### 6. Estrutura de Pastas Completa

```
src/
├── app.js                    # Configuração da aplicação
├── controllers/
│   └── product-controller.js # Lógica de negócio
├── models/
│   └── product.js           # Schema do MongoDB
├── repositories/
│   └── product-repository.js # Acesso a dados
└── routes/
    ├── index.js             # Rotas principais
    └── product-route.js     # Rotas de produtos
```

### 7. Fluxo de Dados

```
Cliente → Route → Controller → Repository → Model → MongoDB
   ↑                                                      ↓
   ← Response ← Controller ← Repository ← Model ← MongoDB
```

**Explicação do Fluxo:**
1. **Route**: Recebe a requisição HTTP e direciona para o controller
2. **Controller**: Processa a requisição e aplica a lógica de negócio
3. **Repository**: Executa operações no banco de dados
4. **Model**: Define a estrutura dos dados
5. **MongoDB**: Armazena os dados

## 🔌 Endpoints da API

### Produtos

- `GET /products` - Lista todos os produtos
- `GET /products/:id` - Busca um produto por ID
- `POST /products` - Cria um novo produto
- `PUT /products/:id` - Atualiza um produto
- `DELETE /products/:id` - Remove um produto

### Exemplo de Uso

#### Criar um Produto
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Teste",
    "description": "Descrição do produto",
    "price": 99.99,
    "category": "Eletrônicos"
  }'
```

#### Listar Produtos
```bash
curl http://localhost:3000/products
```

## 🛠️ Comandos Úteis do Docker

### Gerenciar o Container MongoDB

```bash
# Parar o container
docker stop mongodb

# Iniciar o container
docker start mongodb

# Remover o container
docker rm mongodb

# Ver logs do container
docker logs mongodb

# Acessar o shell do MongoDB
docker exec -it mongodb mongosh -u seu_usuario -p sua_senha
```

### Backup e Restore

```bash
# Backup do banco
docker exec mongodb mongodump --out /data/backup

# Restore do banco
docker exec mongodb mongorestore /data/backup
```

## 🔧 Configurações Adicionais

### Variáveis de Ambiente

Para maior segurança, você pode usar variáveis de ambiente. Crie um arquivo `.env`:

```env
MONGODB_URI=mongodb://seu_usuario:sua_senha@localhost:27017/?authSource=admin
PORT=3000
NODE_ENV=development
```

E instale o pacote `dotenv`:

```bash
npm install dotenv
```

### Configuração com Docker Compose

Alternativamente, você pode usar o arquivo `docker-compose.yml` fornecido:

```bash
docker-compose up -d
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com MongoDB**
   - Verifique se o container está rodando: `docker ps`
   - Confirme se as credenciais estão corretas
   - Verifique se a porta 27017 não está sendo usada por outro processo

2. **Erro de autenticação**
   - Certifique-se de que o `authSource=admin` está na string de conexão
   - Verifique se o usuário e senha estão corretos

3. **Container não inicia**
   - Verifique se a porta 27017 está livre
   - Remova o container antigo: `docker rm mongodb`
   - Execute o comando de criação novamente

### Logs e Debug

```bash
# Ver logs da aplicação
npm start

# Ver logs do MongoDB
docker logs mongodb

# Ver logs do Docker Compose
docker-compose logs
```

## 📝 Notas Importantes

- O MongoDB está configurado para persistir dados em um volume Docker
- A API inclui CORS configurado para aceitar requisições de qualquer origem
- O projeto usa Mongoose como ODM para MongoDB
- A estrutura segue o padrão MVC (Model-View-Controller)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 