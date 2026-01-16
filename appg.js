// Adegan Global Market - Application Logic

// ==================== GLOBAL VARIABLES ====================
let currentSlide = 0;
let slideInterval;
let currentUser = null;
let isAdmin = false;
let products = [];
let customers = [];
let transactions = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadDataFromStorage();
    initializeSlider();
    initializeEventListeners();
    updateProductWall();
    updateCustomerLists();
}

// ==================== DATA PERSISTENCE ====================
function loadDataFromStorage() {
    // Load products
    const storedProducts = localStorage.getItem('adegan_products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        // Initialize with sample products
        products = [];
    }

    // Load customers
    const storedCustomers = localStorage.getItem('adegan_customers');
    if (storedCustomers) {
        customers = JSON.parse(storedCustomers);
    } else {
        // Initialize with admin account
        customers = [
            {
                id: 'ADMIN001',
                serialNumber: 'SN-ADMIN-001',
                name: 'Olawale Abdul-ganiyu',
                email: 'adegan95@gmail.com',
                phone: '+234000000000',
                address: 'Global Enterprise HQ',
                balance: 0,
                accountNumber: '0000000000',
                role: 'admin',
                photo: '',
                createdAt: new Date().toISOString()
            }
        ];
        saveCustomers();
    }

    // Load transactions
    const storedTransactions = localStorage.getItem('adegan_transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
}

function saveProducts() {
    localStorage.setItem('adegan_products', JSON.stringify(products));
}

function saveCustomers() {
    localStorage.setItem('adegan_customers', JSON.stringify(customers));
}

function saveTransactions() {
    localStorage.setItem('adegan_transactions', JSON.stringify(transactions));
}

// ==================== SLIDING NAVIGATION ====================
function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 1) {
        showSlide(0);
        slideInterval = setInterval(nextSlide, 6000); // 6-second interval
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Forgot password
    const forgotPasswordBtn = document.getElementById('forgotPassword');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    }

    // Contact admin button
    const contactAdminBtn = document.getElementById('contactAdminBtn');
    if (contactAdminBtn) {
        contactAdminBtn.addEventListener('click', handleContactAdmin);
    }

    // Customer account creation
    const createCustomerForm = document.getElementById('createCustomerForm');
    if (createCustomerForm) {
        createCustomerForm.addEventListener('submit', handleCreateCustomer);
    }

    // Product upload form
    const uploadProductForm = document.getElementById('uploadProductForm');
    if (uploadProductForm) {
        uploadProductForm.addEventListener('submit', handleProductUpload);
    }

    // Transaction forms
    const creditForm = document.getElementById('creditForm');
    if (creditForm) {
        creditForm.addEventListener('submit', handleCreditCustomer);
    }

    const debitForm = document.getElementById('debitForm');
    if (debitForm) {
        debitForm.addEventListener('submit', handleDebitCustomer);
    }

    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
    }

    // Category filter
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => filterByCategory(btn.textContent));
    });
}

// ==================== AUTHENTICATION ====================
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const accountNumber = document.getElementById('accountNumber').value;

    // Find user
    let user = customers.find(c => c.email === email || c.accountNumber === accountNumber);
    
    if (user) {
        // In production, verify password hash
        currentUser = user;
        isAdmin = user.role === 'admin';
        
        localStorage.setItem('adegan_currentUser', JSON.stringify(currentUser));
        
        if (isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'customer.html';
        }
    } else {
        showNotification('Invalid credentials. Please try again.', 'error');
    }
}

function handleForgotPassword() {
    const email = prompt('Please enter your email address:');
    if (email) {
        const user = customers.find(c => c.email === email);
        if (user) {
            showNotification(`Password reset link sent to ${email}`, 'success');
        } else {
            showNotification('Email not found. Please contact admin at adegan95@gmail.com', 'error');
        }
    }
}

function handleContactAdmin() {
    const subject = encodeURIComponent('Inquiry from Adegan Market');
    const body = encodeURIComponent('Hello Admin,\n\nI would like to inquire about...\n\nBest regards');
    window.open(`mailto:adegan95@gmail.com?subject=${subject}&body=${body}`);
}

// ==================== CUSTOMER MANAGEMENT ====================
function handleCreateCustomer(e) {
    e.preventDefault();
    
    const newCustomer = {
        id: 'CUS' + Date.now(),
        serialNumber: 'SN-' + Date.now(),
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        balance: 0,
        accountNumber: generateAccountNumber(),
        role: 'customer',
        photo: '',
        createdAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    saveCustomers();
    updateCustomerLists();
    
    showNotification(`Customer created successfully! Account Number: ${newCustomer.accountNumber}`, 'success');
    e.target.reset();
}

function generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function closeCustomerAccount(customerId) {
    if (confirm('Are you sure you want to close this account?')) {
        customers = customers.filter(c => c.id !== customerId);
        saveCustomers();
        updateCustomerLists();
        showNotification('Account closed successfully', 'success');
    }
}

function updateCustomerLists() {
    const customerTableBody = document.getElementById('customerTableBody');
    if (customerTableBody) {
        customerTableBody.innerHTML = '';
        
        customers.filter(c => c.role !== 'admin').forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.accountNumber}</td>
                <td>${customer.serialNumber}</td>
                <td>₦${formatNumber(customer.balance)}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-credit" onclick="showCreditModal('${customer.id}')">Credit</button>
                        <button class="btn-action btn-debit" onclick="showDebitModal('${customer.id}')">Debit</button>
                        <button class="btn-action btn-view" onclick="viewCustomerDetails('${customer.id}')">View</button>
                        <button class="btn-action" style="background: #ffc107;" onclick="closeCustomerAccount('${customer.id}')">Close</button>
                    </div>
                </td>
            `;
            customerTableBody.appendChild(row);
        });
    }
}

function viewCustomerDetails(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        const modal = document.getElementById('customerModal');
        document.getElementById('modalCustomerName').textContent = customer.name;
        document.getElementById('modalCustomerEmail').textContent = customer.email;
        document.getElementById('modalCustomerPhone').textContent = customer.phone;
        document.getElementById('modalCustomerAddress').textContent = customer.address;
        document.getElementById('modalCustomerAccount').textContent = customer.accountNumber;
        document.getElementById('modalCustomerSerial').textContent = customer.serialNumber;
        document.getElementById('modalCustomerBalance').textContent = '₦' + formatNumber(customer.balance);
        modal.classList.add('active');
    }
}

// ==================== TRANSACTION MANAGEMENT ====================
function handleCreditCustomer(e) {
    e.preventDefault();
    const customerId = document.getElementById('creditCustomerId').value;
    const amount = parseFloat(document.getElementById('creditAmount').value);
    const description = document.getElementById('creditDescription').value;
    
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        customer.balance += amount;
        
        const transaction = {
            id: 'TXN' + Date.now(),
            type: 'credit',
            customerId: customerId,
            customerName: customer.name,
            accountNumber: customer.accountNumber,
            amount: amount,
            description: description,
            sender: isAdmin ? 'Adegan Global Enterprise' : 'Customer Transfer',
            date: new Date().toISOString()
        };
        
        transactions.push(transaction);
        saveCustomers();
        saveTransactions();
        updateCustomerLists();
        updateTransactionHistory();
        
        showNotification(`Successfully credited ${customer.name} with ₦${formatNumber(amount)}`, 'success');
        document.getElementById('creditForm').reset();
    }
}

function handleDebitCustomer(e) {
    e.preventDefault();
    const customerId = document.getElementById('debitCustomerId').value;
    const amount = parseFloat(document.getElementById('debitAmount').value);
    const description = document.getElementById('debitDescription').value;
    
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        if (customer.balance >= amount) {
            customer.balance -= amount;
            
            const transaction = {
                id: 'TXN' + Date.now(),
                type: 'debit',
                customerId: customerId,
                customerName: customer.name,
                accountNumber: customer.accountNumber,
                amount: amount,
                description: description,
                recipient: isAdmin ? 'Adegan Global Enterprise' : 'Admin Debit',
                date: new Date().toISOString()
            };
            
            transactions.push(transaction);
            saveCustomers();
            saveTransactions();
            updateCustomerLists();
            updateTransactionHistory();
            
            showNotification(`Successfully debited ${customer.name} ₦${formatNumber(amount)}`, 'success');
            document.getElementById('debitForm').reset();
        } else {
            showNotification('Insufficient balance', 'error');
        }
    }
}

function handleTransfer(e) {
    e.preventDefault();
    const recipientName = document.getElementById('recipientName').value;
    const recipientAccount = document.getElementById('recipientAccount').value;
    const recipientBank = document.getElementById('recipientBank').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const purpose = document.getElementById('transferPurpose').value;
    
    const admin = customers.find(c => c.role === 'admin');
    if (admin && admin.balance >= amount) {
        admin.balance -= amount;
        
        const transaction = {
            id: 'TXN' + Date.now(),
            type: 'transfer_out',
            customerId: admin.id,
            customerName: admin.name,
            accountNumber: admin.accountNumber,
            amount: amount,
            recipientName: recipientName,
            recipientAccount: recipientAccount,
            recipientBank: recipientBank,
            purpose: purpose,
            senderCompany: 'Adegan Global Enterprise',
            date: new Date().toISOString()
        };
        
        transactions.push(transaction);
        saveCustomers();
        saveTransactions();
        updateTransactionHistory();
        
        showNotification(`Successfully transferred ₦${formatNumber(amount)} to ${recipientName}`, 'success');
        document.getElementById('transferForm').reset();
    } else {
        showNotification('Insufficient balance in admin account', 'error');
    }
}

function updateTransactionHistory() {
    const transactionContainer = document.getElementById('transactionHistory');
    if (transactionContainer) {
        transactionContainer.innerHTML = '';
        
        transactions.slice(-10).reverse().forEach(txn => {
            const txnElement = document.createElement('div');
            txnElement.className = `transaction-item ${txn.type.includes('credit') ? 'credit' : 'debit'}`;
            txnElement.innerHTML = `
                <div>
                    <strong>${txn.type === 'credit' ? 'Credit' : txn.type === 'debit' ? 'Debit' : 'Transfer'}</strong>
                    <p>${txn.description || txn.purpose || 'Transaction'}</p>
                    <small>${new Date(txn.date).toLocaleString()}</small>
                </div>
                <div class="transaction-amount ${txn.type.includes('credit') ? 'credit' : 'debit'}">
                    ${txn.type.includes('credit') ? '+' : '-'}₦${formatNumber(txn.amount)}
                </div>
            `;
            transactionContainer.appendChild(txnElement);
        });
    }
}

// ==================== PRODUCT MANAGEMENT ====================
function handleProductUpload(e) {
    e.preventDefault();
    
    const product = {
        id: 'PRD' + Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').src || '',
        ownerName: currentUser ? currentUser.name : 'Unknown',
        ownerEmail: currentUser ? currentUser.email : 'Unknown',
        ownerPhone: currentUser ? currentUser.phone : 'Unknown',
        createdAt: new Date().toISOString()
    };
    
    products.push(product);
    saveProducts();
    updateProductWall();
    
    showNotification('Product uploaded successfully!', 'success');
    e.target.reset();
    document.getElementById('productImage').src = '';
}

function updateProductWall() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image" style="background-image: url('${product.image || 'https://via.placeholder.com/300x250?text=Product+Image'}'); background-size: cover; background-position: center;"></div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">₦${formatNumber(product.price)}</p>
                    <p class="product-owner">Seller: ${product.ownerName}</p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Category: ${product.category}</p>
                    <button class="order-button" onclick="showOrderModal('${product.id}')">Place Order</button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }
}

function filterByCategory(category) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === category) {
            btn.classList.add('active');
        }
    });

    const filteredProducts = category === 'All' 
        ? products 
        : products.filter(p => p.category === category);
    
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = '';
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image" style="background-image: url('${product.image || 'https://via.placeholder.com/300x250?text=Product+Image'}'); background-size: cover; background-position: center;"></div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">₦${formatNumber(product.price)}</p>
                    <p class="product-owner">Seller: ${product.ownerName}</p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Category: ${product.category}</p>
                    <button class="order-button" onclick="showOrderModal('${product.id}')">Place Order</button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }
}

// ==================== ORDER MANAGEMENT ====================
function showOrderModal(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductPrice').textContent = '₦' + formatNumber(product.price);
        document.getElementById('modalProductOwner').textContent = product.ownerName;
        document.getElementById('modalProductOwnerEmail').textContent = product.ownerEmail;
        document.getElementById('modalProductOwnerPhone').textContent = product.ownerPhone;
        document.getElementById('orderModal').classList.add('active');
    }
}

function placeOrder() {
    const quantity = document.getElementById('orderQuantity').value;
    const size = document.getElementById('orderSize').value;
    const color = document.getElementById('orderColor').value;
    
    showNotification(`Order placed successfully! Quantity: ${quantity}, Size: ${size}, Color: ${color}`, 'success');
    closeModal('orderModal');
}

// ==================== UTILITY FUNCTIONS ====================
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function formatNumber(number) {
    return number.toLocaleString('en-NG');
}

// Modal close handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
        e.target.classList.remove('active');
    }
});