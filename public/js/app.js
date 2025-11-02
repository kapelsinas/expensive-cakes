// API Configuration
const API_BASE_URL = '';

// API Client Functions
const api = {
  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async getCart() {
    return this.request('GET', '/cart');
  },

  async addItem(item) {
    return this.request('POST', '/cart/items', item);
  },

  async updateItem(itemId, quantity) {
    return this.request('PATCH', `/cart/items/${itemId}`, { quantity });
  },

  async removeItem(itemId) {
    return this.request('DELETE', `/cart/items/${itemId}`);
  },

  async clearCart() {
    return this.request('DELETE', '/cart');
  },

  async checkout(preferredPaymentProvider = null) {
    return this.request('POST', '/orders/checkout', { preferredPaymentProvider });
  },

  async initiatePayment(orderId, provider) {
    return this.request('POST', '/payments/initiate', { orderId, provider });
  },

  async getOrderStatus(orderId) {
    return this.request('GET', `/orders/${orderId}/status`);
  },

  async getOrder(orderId) {
    return this.request('GET', `/orders/${orderId}`);
  },

  async getOrderPayments(orderId) {
    return this.request('GET', `/payments/order/${orderId}`);
  },
};

// Utility Functions
const utils = {
  formatPrice(amount, currency = 'EUR') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  },

  showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    } else {
      alert(message);
    }
  },

  showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 3000);
    }
  },

  setLoading(element, loading) {
    if (loading) {
      element.disabled = true;
      element.classList.add('loading');
    } else {
      element.disabled = false;
      element.classList.remove('loading');
    }
  },

  pollOrderStatus(orderId, onSuccess, maxAttempts = 30) {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const status = await api.getOrderStatus(orderId);
        if (status.status === 'PAID' || status.status === 'FAILED' || attempts >= maxAttempts) {
          clearInterval(interval);
          onSuccess(status);
        }
      } catch (error) {
        clearInterval(interval);
        utils.showError('Failed to check order status');
      }
    }, 2000);
    return interval;
  },
};
