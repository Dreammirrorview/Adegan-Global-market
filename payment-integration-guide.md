# Adegan Global Market - Payment Integration Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Supported Payment Methods](#supported-payment-methods)
3. [API Integration](#api-integration)
4. [Transaction Types](#transaction-types)
5. [Security Protocols](#security-protocols)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Deployment](#deployment)

## Introduction

This guide provides detailed instructions for integrating with the Adegan Global Market payment system. The system supports multiple payment methods and integrates with Nigeria's leading payment gateways.

## Supported Payment Methods

### 1. Bank Transfer
- **Description**: Direct bank transfer to customer/admin accounts
- **Processing Time**: Instant (NIBSS)
- **Fee**: ₦50 per transaction
- **Limits**: ₦1,000 - ₦10,000,000

### 2. Card Payment (Visa/MasterCard)
- **Description**: Debit and credit card payments
- **Processing Time**: Instant
- **Fee**: 1.5% + ₦100 per transaction
- **Limits**: ₦1,000 - ₦5,000,000

### 3. USSD Payment
- **Description**: Mobile banking via USSD codes
- **Processing Time**: Instant
- **Fee**: ₦100 per transaction
- **Limits**: ₦500 - ₦500,000

### 4. Wallet Transfer
- **Description**: Internal wallet to wallet transfer
- **Processing Time**: Instant
- **Fee**: Free
- **Limits**: No limit

## API Integration

### Authentication

All API requests require authentication using API keys and OAuth 2.0 tokens.

```javascript
// Example: Authentication Request
const authenticate = async () => {
    const response = await fetch('https://api.adeganmarket.com/v1/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'API-Key': 'your-api-key'
        },
        body: JSON.stringify({
            email: 'user@example.com',
            password: 'password'
        })
    });
    
    const data = await response.json();
    return data.accessToken;
};
```

### Credit Customer Account

Endpoint: `POST /api/v1/accounts/credit`

```javascript
const creditAccount = async (accountId, amount, description) => {
    const token = await authenticate();
    
    const response = await fetch('https://api.adeganmarket.com/v1/accounts/credit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            accountId: accountId,
            amount: amount,
            description: description,
            sender: 'Adegan Global Enterprise',
            timestamp: new Date().toISOString()
        })
    });
    
    return await response.json();
};
```

### Debit Customer Account

Endpoint: `POST /api/v1/accounts/debit`

```javascript
const debitAccount = async (accountId, amount, description) => {
    const token = await authenticate();
    
    const response = await fetch('https://api.adeganmarket.com/v1/accounts/debit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            accountId: accountId,
            amount: amount,
            description: description,
            recipient: 'Adegan Global Enterprise',
            timestamp: new Date().toISOString()
        })
    });
    
    return await response.json();
};
```

### Transfer to External Bank

Endpoint: `POST /api/v1/transfers/external`

```javascript
const transferToBank = async (transferData) => {
    const token = await authenticate();
    
    const response = await fetch('https://api.adeganmarket.com/v1/transfers/external', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            recipientName: transferData.recipientName,
            recipientAccount: transferData.recipientAccount,
            recipientBank: transferData.recipientBank,
            amount: transferData.amount,
            purpose: transferData.purpose,
            senderCompany: 'Adegan Global Enterprise',
            reference: generateReference(),
            timestamp: new Date().toISOString()
        })
    });
    
    return await response.json();
};
```

### Query Transaction Status

Endpoint: `GET /api/v1/transactions/{transactionId}`

```javascript
const getTransactionStatus = async (transactionId) => {
    const token = await authenticate();
    
    const response = await fetch(`https://api.adeganmarket.com/v1/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    return await response.json();
};
```

## Transaction Types

### Credit Transaction
```json
{
    "transactionId": "TXN20240115123456",
    "type": "credit",
    "customerId": "CUS123456789",
    "customerName": "John Doe",
    "accountNumber": "1234567890",
    "amount": 50000,
    "description": "Product sale payment",
    "sender": "Adegan Global Enterprise",
    "status": "completed",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### Debit Transaction
```json
{
    "transactionId": "TXN20240115123457",
    "type": "debit",
    "customerId": "CUS123456789",
    "customerName": "John Doe",
    "accountNumber": "1234567890",
    "amount": 25000,
    "description": "Product purchase",
    "recipient": "Adegan Global Enterprise",
    "status": "completed",
    "timestamp": "2024-01-15T10:35:00Z"
}
```

### External Transfer
```json
{
    "transactionId": "TXN20240115123458",
    "type": "transfer_out",
    "customerId": "ADMIN001",
    "customerName": "Adegan Global Enterprise",
    "accountNumber": "0000000000",
    "amount": 100000,
    "recipientName": "Jane Smith",
    "recipientAccount": "9876543210",
    "recipientBank": "GTBank",
    "purpose": "Supplier payment",
    "senderCompany": "Adegan Global Enterprise",
    "status": "pending",
    "timestamp": "2024-01-15T10:40:00Z"
}
```

## Security Protocols

### 1. API Key Management
- Store API keys securely (environment variables)
- Rotate keys every 90 days
- Use different keys for development and production

### 2. Request Signing
All requests must be signed with HMAC-SHA256:

```javascript
const crypto = require('crypto');

const signRequest = (apiKey, apiSecret, payload) => {
    const timestamp = Date.now();
    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${timestamp}${JSON.stringify(payload)}`)
        .digest('hex');
    
    return {
        'X-API-Key': apiKey,
        'X-Timestamp': timestamp,
        'X-Signature': signature
    };
};
```

### 3. Webhook Security
- Verify webhook signatures
- Use HTTPS only
- Implement replay attack prevention

### 4. Data Encryption
- Encrypt sensitive data at rest (AES-256)
- Encrypt data in transit (TLS 1.3)
- Never log full credit card numbers

## Error Handling

### Error Response Format
```json
{
    "error": {
        "code": "PAYMENT_001",
        "message": "Insufficient funds",
        "details": {
            "balance": 25000,
            "requested": 50000
        },
        "timestamp": "2024-01-15T10:45:00Z"
    }
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| PAYMENT_001 | Insufficient funds | Check account balance |
| PAYMENT_002 | Invalid account number | Verify account details |
| PAYMENT_003 | Transaction timeout | Retry the transaction |
| PAYMENT_004 | Fraud detected | Contact support |
| PAYMENT_005 | Rate limit exceeded | Reduce request frequency |

### Retry Logic
```javascript
const retryTransaction = async (transactionFunc, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await transactionFunc();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            
            const delay = Math.pow(2, i) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};
```

## Testing

### Sandbox Environment
- URL: `https://sandbox-api.adeganmarket.com/v1`
- Test accounts available
- No real money transactions

### Test Scenarios

1. **Credit Account Test**
```javascript
// Test: Credit customer account
const result = await creditAccount('TEST123456', 10000, 'Test credit');
console.assert(result.status === 'success', 'Credit test failed');
```

2. **Debit Account Test**
```javascript
// Test: Debit customer account
const result = await debitAccount('TEST123456', 5000, 'Test debit');
console.assert(result.status === 'success', 'Debit test failed');
```

3. **External Transfer Test**
```javascript
// Test: Transfer to external bank
const result = await transferToBank({
    recipientName: 'Test User',
    recipientAccount: '1234567890',
    recipientBank: 'Test Bank',
    amount: 10000,
    purpose: 'Test transfer'
});
console.assert(result.status === 'success', 'Transfer test failed');
```

### Integration Checklist
- [ ] API authentication working
- [ ] Credit transactions successful
- [ ] Debit transactions successful
- [ ] External transfers working
- [ ] Error handling tested
- [ ] Webhook receiving notifications
- [ ] Security protocols implemented
- [ ] Performance benchmarks met

## Deployment

### Pre-Deployment Checklist
- [ ] All tests passed
- [ ] API keys configured
- [ ] Security settings reviewed
- [ ] Error monitoring setup
- [ ] Backup procedures verified
- [ ] Support team notified

### Production Environment
- URL: `https://api.adeganmarket.com/v1`
- Rate limiting: 100 requests/minute
- Support: 24/7 available

### Monitoring
- Real-time transaction monitoring
- Performance metrics dashboard
- Error alerting system
- Daily transaction reports

## Support

For integration support, contact:
- **Email**: adegan95@gmail.com
- **Phone**: +234-XXX-XXX-XXXX
- **Documentation**: https://docs.adeganmarket.com
- **Status Page**: https://status.adeganmarket.com

---

*Last Updated: January 2024*
*Version: 1.0.0*