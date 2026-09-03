const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom fetch wrapper dengan penanganan JSON dan token auth otomatis
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('kopi_senja_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // 1. Categories & Products
  getCategories: () => request('/api/categories'),
  getProducts: (params = '') => request(`/api/products${params ? `?${params}` : ''}`),
  getProductById: (id) => request(`/api/products/${id}`),
  createProduct: (body) => request('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
  generateDescription: (name, category) => 
    request('/api/products/generate-description', { method: 'POST', body: JSON.stringify({ name, category }) }),

  // 2. Orders & Self-Ordering
  createOrder: (body) => request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrders: (params = '') => request(`/api/orders${params ? `?${params}` : ''}`),
  getOrderById: (id) => request(`/api/orders/${id}`),
  confirmCashierPayment: (id) => request(`/api/orders/${id}/confirm-payment`, { method: 'PATCH' }),
  updateOrderStatus: (id, order_status) => 
    request(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ order_status }) }),

  // 3. Display & Tracking
  getQueueDisplay: () => request('/api/display/queue'),
  trackOrder: (orderIdOrQueue) => request(`/api/display/track/${orderIdOrQueue}`),

  // 4. Payment & Simulation
  checkPaymentStatus: (orderId) => request(`/api/payment/status/${orderId}`),
  simulatePaymentSuccess: (orderId) => request(`/api/payment/simulate-success/${orderId}`, { method: 'POST' }),

  // 5. Auth
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/api/auth/me'),
};

export default api;
