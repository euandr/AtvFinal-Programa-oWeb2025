# Sistema Bancário Digital

Um sistema web simples que simula operações bancárias básicas, incluindo PIX, desenvolvido como projeto final da disciplina.

## 🚀 Funcionalidades

- **Login Seguro**: Autenticação com usuário e senha
- **Dashboard**: Visualização do saldo e menu de funcionalidades
- **PIX Avançado**: 
  - Seleção de tipo de chave PIX (E-mail, Celular, CPF, Chave Aleatória)
  - Formatação automática baseada no tipo selecionado
  - Validação específica para cada tipo de chave
  - Formatação monetária em tempo real (da direita para esquerda)
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
   - Realize transferências PIX com formatação automática
   - Consulte seu extrato com filtros

## 💳 Funcionalidades PIX Detalhadas

### **Seleção de Tipo de Chave**
- **E-mail**: Formatação automática para minúsculo
- **Celular**: Formatação como (11) 99999-9999
- **CPF**: Formatação como 123.456.789-00
- **Chave Aleatória**: Limitação a 36 caracteres

### **Formatação Monetária**
- Valores formatados da direita para esquerda
- Exemplo: Digite `123` → aparece `1,23`
- Suporte a valores até R$ 999.999,99
- Formatação em tempo real conforme digitação

### **Validação Inteligente**
- Validação específica para cada tipo de chave
- Mensagens de erro personalizadas
- Verificação de DDD para telefones
- Limite máximo de R$ 5.000,00 por transação

## 🔐 Segurança

- Validação de entrada em todos os formulários
- Sanitização de dados para prevenir XSS
- Validação específica de chaves PIX por tipo:
  - **E-mail**: Validação de formato de e-mail
  - **Celular**: Validação de DDD e 11 dígitos
  - **CPF**: Validação de 11 dígitos
  - **Chave Aleatória**: Validação de 36 caracteres
- Limites de valor para transferências PIX (máximo R$ 5.000,00)
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
- **Componentes customizados**:
  - Select com seta personalizada e hover effects
  - Botões com gradientes e animações
  - Campos com formatação em tempo real
  - Estados visuais claros (habilitado/desabilitado)



## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte de uma atividade final de disciplina.
