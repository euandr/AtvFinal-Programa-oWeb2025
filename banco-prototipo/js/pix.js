document.addEventListener('DOMContentLoaded', function() {
    initializePix();
});

function initializePix() {
    const pixForm = document.getElementById('pixForm');
    if (pixForm) {
        pixForm.addEventListener('submit', handlePixTransfer);
    }
    
    loadPixHistory();
    addInputMasks();
}

async function handlePixTransfer(e) {
    e.preventDefault();
    
    hideMessages();
    
    const pixKey = document.getElementById('pixKey').value.trim();
    const pixValue = parseFloat(document.getElementById('pixValue').value);
    const pixDescription = document.getElementById('pixDescription').value.trim();
    
    if (!validatePixKey(pixKey)) {
        showError('pixError', 'Chave PIX inválida. Use CPF, e-mail, telefone ou chave aleatória.');
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
    
    addTransaction('pix', `PIX para ${pixKey}${description ? ' - ' + description : ''}`, -value, pixKey);
    
    saveUserData();
    
    updateUI();
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
        pixKeyInput.addEventListener('blur', function(e) {
            e.target.value = formatPixKey(e.target.value);
        });
    }
    
    if (pixValueInput) {
        pixValueInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d,]/g, '');
            
            const commaCount = (value.match(/,/g) || []).length;
            if (commaCount > 1) {
                value = value.replace(/,.*,/, ',');
            }
            
            if (value.includes(',')) {
                const parts = value.split(',');
                if (parts[1] && parts[1].length > 2) {
                    parts[1] = parts[1].substring(0, 2);
                    value = parts.join(',');
                }
            }
            
            e.target.value = value;
        });
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
    const examples = [50.00, 100.00, 250.00, 500.00];
    const randomValue = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('pixValue').value = randomValue.toFixed(2);
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

function fillExampleEmail() {
    document.getElementById('pixKey').value = 'usuario@exemplo.com';
}

function fillExamplePhone() {
    const input = document.getElementById('pixKey');
    input.value = '11987654321';
    input.value = formatPixKey(input.value);
}

function fillExampleCPF() {
    const input = document.getElementById('pixKey');
    input.value = '12345678909';
    input.value = formatPixKey(input.value);
}

function fillExampleRandom() {
    document.getElementById('pixKey').value = generateRandomPixKey();
}

window.generateExamplePixKey = generateExamplePixKey;
window.fillExampleValue = fillExampleValue;
window.addExampleButtons = addExampleButtons;
window.fillExampleEmail = fillExampleEmail;
window.fillExamplePhone = fillExamplePhone;
window.fillExampleCPF = fillExampleCPF;
window.fillExampleRandom = fillExampleRandom;