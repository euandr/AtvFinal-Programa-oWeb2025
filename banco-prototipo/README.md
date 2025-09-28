# Sistema Bancário Digital (protótipo)

Um sistema web simples que simula operações bancárias básicas, incluindo PIX, desenvolvido como projeto final da disciplina "programação web".

## 🚀 Funcionalidades

- **Login Seguro**: Autenticação com usuário e senha
- **Dashboard**: Visualização do saldo e menu de funcionalidades
- **PIX**: 
  - Seleção de tipo de chave PIX (E-mail, Celular, CPF, Chave Aleatória)
  - Formatação automática baseada no tipo selecionado
  - Validação específica para cada tipo de chave
  - Formatação monetária (da direita para esquerda)
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
0. **Clone o repositório**:
   ```bash
   git clone https://github.com/euandr/AtvFinal-Programa-oWeb2025.git
   cd AtvFinal-Programa-oWeb2025

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

### **Validação Inteligente**
- Validação específica para cada tipo de chave
- Mensagens de erro personalizadas
- Verificação de DDD para telefones
- Limite máximo de R$ 5.000,00 por transação

## 🔐 Segurança

- Validação de entrada em todos os formulários
- Validação específica de chaves PIX por tipo:
  - **E-mail**: Validação de formato de e-mail
  - **Celular**: Validação de DDD e 11 dígitos
  - **CPF**: Validação de 11 dígitos
  - **Chave Aleatória**: Validação de 36 caracteres
- Limites de valor para transferências PIX (máximo R$ 5.000,00)
- Verificação de saldo antes de transações

# Demonstração do Sistema

![Demonstração do site](https://github.com/euandr/euandr/blob/main/arquivosEscola/atvfinalPW.gif?raw=true)

> **Observação:** A qualidade do vídeo está baixa, por isso algumas funções podem parecer diferentes do real.
