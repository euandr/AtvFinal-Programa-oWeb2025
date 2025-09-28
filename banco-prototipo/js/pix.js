document.addEventListener('DOMContentLoaded', function() {
    initializePix();
});

function initializePix() {
    const pixForm = document.getElementById('pixForm');
    if (pixForm) {
        pixForm.addEventListener('submit', handlePixTransfer);
    }
    
    // Inicializa o campo de valor com 0,00
    const pixValueInput = document.getElementById('pixValue');
    if (pixValueInput) {
        pixValueInput.value = '0,00';
    }
    
    loadPixHistory();
    addInputMasks();
}

async function handlePixTransfer(e) {
    e.preventDefault();
    
    hideMessages();
    
    const pixKeyType = document.getElementById('pixKeyType').value;
    const pixKey = document.getElementById('pixKey').value.trim();
    const pixValue = parseCurrencyValue(document.getElementById('pixValue').value);
    const pixDescription = document.getElementById('pixDescription').value.trim();
    
    if (!pixKeyType) {
        showError('pixError', 'Selecione o tipo de chave PIX.');
        return;
    }
    
    if (!validatePixKeyByType(pixKey, pixKeyType)) {
        showError('pixError', getValidationMessageForType(pixKeyType));
        return;
    }
    
    if (pixValue <= 0) {
        showError('pixError', 'Valor deve ser maior que zero.');
        return;
    }
    
    if (pixValue > currentUser.balance) {
        showError('pixError', 'Saldo insuficiente para realizar a transferência.');
        return;
    }
    
    if (pixValue > 5000) {
        showError('pixError', 'Valor máximo para PIX é R$ 5.000,00.');
        return;
    }
    
    const submitBtn = document.querySelector('.pix-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    submitBtn.disabled = true;
    
    try {
        await simulateProcessing(2000);
        
        processPixTransfer(pixKey, pixValue, pixDescription);
        
        document.getElementById('pixForm').reset();
        
        showSuccess('pixSuccess', 'PIX enviado com sucesso!');
        
        loadPixHistory();
        
    } catch (error) {
        showError('pixError', 'Erro ao processar PIX. Tente novamente.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function processPixTransfer(pixKey, value, description) {
    currentUser.balance -= value;
    
    const pixKeyType = document.getElementById('pixKeyType').value;
    const typeLabel = getTypeLabel(pixKeyType);
    
    addTransaction('pix', `PIX para ${typeLabel}: ${pixKey}${description ? ' - ' + description : ''}`, -value, pixKey);
    
    saveUserData();
    
    updateUI();
}

function getTypeLabel(type) {
    switch (type) {
        case 'email':
            return 'E-mail';
        case 'phone':
            return 'Celular';
        case 'cpf':
            return 'CPF';
        case 'random':
            return 'Chave Aleatória';
        default:
            return 'Chave PIX';
    }
}

function loadPixHistory() {
    const container = document.getElementById('pixHistory');
    if (!container) return;
    
    const pixTransactions = currentUser.transactions.filter(t => t.type === 'pix');
    
    if (pixTransactions.length === 0) {
        container.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma transferência PIX realizada</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pixTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon pix">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <div class="transaction-details">
                    <h4>PIX para ${transaction.pixKey}</h4>
                    <p>${transaction.description}</p>
                    <small>${formatDate(transaction.date)}</small>
                </div>
            </div>
            <div class="transaction-amount negative-amount">
                -R$ ${formatCurrency(Math.abs(transaction.amount))}
            </div>
        </div>
    `).join('');
}

function isValidDDD(ddd) {
    const validDDDs = [
        '11', '12', '13', '14', '15', '16', '17', '18', '19',
        '21', '22', '24', '27', '28',
        '31', '32', '33', '34', '35', '37', '38',
        '41', '42', '43', '44', '45', '46', '47', '48', '49',
        '51', '53', '54', '55',
        '61', '62', '63', '64', '65', '66', '67', '68', '69',
        '71', '73', '74', '75', '77', '79',
        '81', '82', '83', '84', '85', '86', '87', '88', '89',
        '91', '92', '93', '94', '95', '96', '97', '98', '99'
    ];
    return validDDDs.includes(ddd);
}

function formatPixKey(value) {
    let numeric = value.replace(/\D/g, '');

    if (numeric.length === 11) {
        if (isValidDDD(numeric.substring(0, 2))) {
            return numeric.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else {
            return numeric.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
    }

    if (numeric.length === 10) {
        return numeric.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return value.trim();
}

function addInputMasks() {
    const pixKeyInput = document.getElementById('pixKey');
    const pixValueInput = document.getElementById('pixValue');
    
    if (pixKeyInput) {
        pixKeyInput.addEventListener('input', function(e) {
            formatPixKeyByType(e.target);
        });
    }
    
    if (pixValueInput) {
        pixValueInput.addEventListener('input', function(e) {
            formatCurrencyInput(e.target);
        });
    }
}

function formatCurrencyInput(input) {
    // Remove tudo que não é dígito
    let value = input.value.replace(/\D/g, '');
    
    // Se não há valor, define como 0
    if (!value) {
        input.value = '0,00';
        return;
    }
    
    // Converte para centavos (multiplica por 100 para trabalhar com inteiros)
    let cents = parseInt(value);
    
    // Formata o valor
    let formatted = formatCurrencyFromCents(cents);
    
    input.value = formatted;
}

function formatCurrencyFromCents(cents) {
    // Converte centavos para reais
    let reais = Math.floor(cents / 100);
    let centavos = cents % 100;
    
    // Formata os centavos sempre com 2 dígitos
    let centavosStr = centavos.toString().padStart(2, '0');
    
    // Formata os reais com separadores de milhares
    let reaisStr = reais.toLocaleString('pt-BR');
    
    return `${reaisStr},${centavosStr}`;
}

function parseCurrencyValue(formattedValue) {
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    let cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue);
}

function onPixKeyTypeChange() {
    const pixKeyType = document.getElementById('pixKeyType').value;
    const pixKeyInput = document.getElementById('pixKey');
    const pixKeyHelp = document.getElementById('pixKeyHelp');
    const pixExamples = document.getElementById('pixExamples');
    
    // Limpa o campo de chave
    pixKeyInput.value = '';
    
    if (pixKeyType) {
        // Habilita o campo
        pixKeyInput.disabled = false;
        pixKeyInput.placeholder = getPlaceholderForType(pixKeyType);
        pixKeyHelp.textContent = getHelpTextForType(pixKeyType);
        pixExamples.style.display = 'block';
    } else {
        // Desabilita o campo
        pixKeyInput.disabled = true;
        pixKeyInput.placeholder = 'Selecione o tipo primeiro';
        pixKeyHelp.textContent = 'Selecione o tipo de chave PIX acima';
        pixExamples.style.display = 'none';
    }
}

function getPlaceholderForType(type) {
    switch (type) {
        case 'email':
            return 'usuario@exemplo.com';
        case 'phone':
            return '(11) 99999-9999';
        case 'cpf':
            return '123.456.789-00';
        case 'random':
            return '12345678-1234-1234-1234-123456789012';
        default:
            return 'Digite a chave PIX';
    }
}

function getHelpTextForType(type) {
    switch (type) {
        case 'email':
            return 'Digite um e-mail válido';
        case 'phone':
            return 'Digite o número do celular (11 dígitos)';
        case 'cpf':
            return 'Digite o CPF (11 dígitos)';
        case 'random':
            return 'Digite a chave aleatória (36 caracteres)';
        default:
            return 'Selecione o tipo de chave PIX acima';
    }
}

function formatPixKeyByType(input) {
    const pixKeyType = document.getElementById('pixKeyType').value;
    
    if (!pixKeyType) return;
    
    let value = input.value;
    
    switch (pixKeyType) {
        case 'email':
            // Para email, apenas remove espaços e converte para minúsculo
            input.value = value.toLowerCase().trim();
            break;
            
        case 'phone':
            // Formatação de telefone
            input.value = formatPhoneNumber(value);
            break;
            
        case 'cpf':
            // Formatação de CPF
            input.value = formatCPF(value);
            break;
            
        case 'random':
            // Para chave aleatória, remove caracteres especiais e limita a 36 caracteres
            input.value = value.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 36);
            break;
    }
}

function formatPhoneNumber(value) {
    // Remove tudo que não é dígito
    let numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    numbers = numbers.substring(0, 11);
    
    if (numbers.length <= 2) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
    } else {
        return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    }
}

function formatCPF(value) {
    // Remove tudo que não é dígito
    let numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    numbers = numbers.substring(0, 11);
    
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 6) {
        return `${numbers.substring(0, 3)}.${numbers.substring(3)}`;
    } else if (numbers.length <= 9) {
        return `${numbers.substring(0, 3)}.${numbers.substring(3, 6)}.${numbers.substring(6)}`;
    } else {
        return `${numbers.substring(0, 3)}.${numbers.substring(3, 6)}.${numbers.substring(6, 9)}-${numbers.substring(9)}`;
    }
}

function generateExamplePixKey() {
    const examples = [
        '123.456.789-00',
        'usuario@exemplo.com',
        '(11) 99999-9999',
        generateRandomPixKey()
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('pixKey').value = randomExample;
}

function fillExampleValue() {
    const examples = [5000, 10000, 25000, 50000]; // Valores em centavos
    const randomValue = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('pixValue').value = formatCurrencyFromCents(randomValue);
}

function addExampleButtons() {
    const form = document.getElementById('pixForm');
    if (!form) return;
    
    const exampleButtons = document.createElement('div');
    exampleButtons.className = 'example-buttons';
    exampleButtons.innerHTML = `
        <button type="button" onclick="generateExamplePixKey()" class="example-btn">
            <i class="fas fa-key"></i> Chave Exemplo
        </button>
        <button type="button" onclick="fillExampleValue()" class="example-btn">
            <i class="fas fa-dollar-sign"></i> Valor Exemplo
        </button>
    `;
    
    form.appendChild(exampleButtons);
}

function validatePixKeyByType(key, type) {
    switch (type) {
        case 'email':
            return validateEmail(key);
        case 'phone':
            return validatePhone(key);
        case 'cpf':
            return validateCPF(key);
        case 'random':
            return validateRandomKey(key);
        default:
            return false;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 11 && isValidDDD(numbers.substring(0, 2));
}

function validateCPF(cpf) {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
}

function validateRandomKey(key) {
    return key.length === 36 && /^[a-zA-Z0-9-]+$/.test(key);
}

function getValidationMessageForType(type) {
    switch (type) {
        case 'email':
            return 'E-mail inválido. Digite um e-mail válido.';
        case 'phone':
            return 'Telefone inválido. Digite um número de celular válido (11 dígitos).';
        case 'cpf':
            return 'CPF inválido. Digite um CPF válido (11 dígitos).';
        case 'random':
            return 'Chave aleatória inválida. Digite uma chave de 36 caracteres.';
        default:
            return 'Chave PIX inválida.';
    }
}

function fillExampleKey() {
    const pixKeyType = document.getElementById('pixKeyType').value;
    const pixKeyInput = document.getElementById('pixKey');
    
    switch (pixKeyType) {
        case 'email':
            pixKeyInput.value = 'usuario@exemplo.com';
            break;
        case 'phone':
            pixKeyInput.value = '(11) 99999-9999';
            break;
        case 'cpf':
            pixKeyInput.value = '123.456.789-00';
            break;
        case 'random':
            pixKeyInput.value = generateRandomPixKey();
            break;
    }
}

function fillExampleEmail() {
    document.getElementById('pixKeyType').value = 'email';
    onPixKeyTypeChange();
    document.getElementById('pixKey').value = 'usuario@exemplo.com';
}

function fillExamplePhone() {
    document.getElementById('pixKeyType').value = 'phone';
    onPixKeyTypeChange();
    document.getElementById('pixKey').value = '(11) 99999-9999';
}

function fillExampleCPF() {
    document.getElementById('pixKeyType').value = 'cpf';
    onPixKeyTypeChange();
    document.getElementById('pixKey').value = '123.456.789-00';
}

function fillExampleRandom() {
    document.getElementById('pixKeyType').value = 'random';
    onPixKeyTypeChange();
    document.getElementById('pixKey').value = generateRandomPixKey();
}

window.generateExamplePixKey = generateExamplePixKey;
window.fillExampleValue = fillExampleValue;
window.addExampleButtons = addExampleButtons;
window.fillExampleEmail = fillExampleEmail;
window.fillExamplePhone = fillExamplePhone;
window.fillExampleCPF = fillExampleCPF;
window.fillExampleRandom = fillExampleRandom;
window.onPixKeyTypeChange = onPixKeyTypeChange;
window.fillExampleKey = fillExampleKey;