# Sistema Bancário Digital

Um sistema web simples que simula operações bancárias básicas, incluindo PIX, desenvolvido como projeto final da disciplina.

## 🚀 Funcionalidades

- **Login Seguro**: Autenticação com usuário e senha
- **Dashboard**: Visualização do saldo e menu de funcionalidades
- **PIX**: Transferências instantâneas com validação de chaves
- **Extrato**: Histórico completo de transações com filtros
- **Design Responsivo**: Interface adaptável para diferentes dispositivos

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com Flexbox e Grid
- **JavaScript**: Funcionalidades interativas
- **LocalStorage**: Persistência de dados no navegador
- **Font Awesome**: Ícones modernos e consistentes

## 📁 Estrutura do Projeto

```
banco-simulado/
├── css/
│   └── style.css      # Estilos responsivos

├── js/
│   └── extrato.js     # Funcionalidades de extrato
│   ├── pix.js         # Funcionalidades PIX
│   ├── principal.js      # JavaScript principal

├── dashboard.html      # Dashboard principal
├── extrato.html       # Página de extrato
├── login.html          # Página de login
├── pix.html           # Página de transferências PIX
└── README.md          # Documentação
```

## 🚀 Como Usar

1. **Acesse o sistema**: Abra `login.html` no navegador
2. **Faça login**: Use as credenciais de demonstração:
   - **Usuário**: admin
   - **Senha**: 123456
3. **Explore as funcionalidades**:
   - Visualize seu saldo no dashboard
   - Realize transferências PIX
   - Consulte seu extrato com filtros

## 🔐 Segurança

- Validação de entrada em todos os formulários
- Sanitização de dados para prevenir XSS
- Validação de chaves PIX (CPF, e-mail, telefone, chave aleatória)
- Limites de valor para transferências PIX
- Verificação de saldo antes de transações

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)

## 🎨 Design

- Interface moderna e limpa
- Gradientes e sombras para profundidade
- Cores consistentes e acessíveis
- Animações suaves e transições
- Ícones intuitivos



## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte de uma atividade final de disciplina.
