const API_BASE_URL = 'http://localhost:5000';
// Admin panel is hidden at a secret path — must match backend ADMIN_SECRET_PATH
const ADMIN_PATH = 'control-panel-8x7k2m';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = data?.message || `HTTP error! status: ${response.status}`;
      throw new Error(error);
    }

    return data;
  }

  private async fetchWithoutAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = data?.message || `HTTP error! status: ${response.status}`;
      throw new Error(error);
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.fetchWithoutAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.fetchWithoutAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout() {
    return this.fetchWithAuth('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.fetchWithAuth('/api/auth/me');
  }

  async changePassword(data: { current_password: string; new_password: string }) {
    return this.fetchWithAuth('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin
  async getAdminStats() {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/stats`);
  }

  async getAdminRestaurants(params?: { status?: string; search?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/restaurants?${query}`);
  }

  async getAdminRestaurant(id: number) {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/restaurants/${id}`);
  }

  async createRestaurant(data: any) {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/restaurants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(id: number, data: any) {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRestaurant(id: number) {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/restaurants/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminRestaurantStaff(restaurantId: number) {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/restaurants/${restaurantId}/staff`);
  }

  async updateAdminUser(userId: number, data: any) {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminOrders(params?: { status?: string; restaurant_id?: number; page?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.restaurant_id) query.append('restaurant_id', String(params.restaurant_id));
    if (params?.page) query.append('page', String(params.page));
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/orders?${query}`);
  }

  async getAdminAnalytics(days?: number) {
    const query = days ? `?days=${days}` : '';
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/analytics${query}`);
  }

  async getAdminTemplates() {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/templates`);
  }

  async createTemplate(data: any) {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/templates`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: number, data: any) {
    return this.fetchWithAuth(`/api/${ADMIN_PATH}/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.fetchWithAuth('/api/dashboard/stats');
  }

  async getRestaurantProfile() {
    return this.fetchWithAuth('/api/dashboard/restaurant');
  }

  async updateRestaurantProfile(data: any) {
    return this.fetchWithAuth('/api/dashboard/restaurant', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Categories
  async getCategories() {
    return this.fetchWithAuth('/api/dashboard/categories');
  }

  async createCategory(data: { name: string; description?: string }) {
    return this.fetchWithAuth('/api/dashboard/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: any) {
    return this.fetchWithAuth(`/api/dashboard/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.fetchWithAuth(`/api/dashboard/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Menu Items
  async getItems(categoryId?: number) {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return this.fetchWithAuth(`/api/dashboard/items${query}`);
  }

  async createItem(data: any) {
    return this.fetchWithAuth('/api/dashboard/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: number, data: any) {
    return this.fetchWithAuth(`/api/dashboard/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: number) {
    return this.fetchWithAuth(`/api/dashboard/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(params?: { status?: string; page?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    return this.fetchWithAuth(`/api/dashboard/orders?${query}`);
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.fetchWithAuth(`/api/dashboard/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ order_status: status }),
    });
  }

  async updateOrderPayment(orderId: number, status: string) {
    return this.fetchWithAuth(`/api/dashboard/orders/${orderId}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: status }),
    });
  }

  // Design
  async getDesign() {
    return this.fetchWithAuth('/api/dashboard/design');
  }

  async saveDesignDraft(data: { settings_json: any; template_key: string }) {
    return this.fetchWithAuth('/api/dashboard/design/draft', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async publishDesign(data: { settings_json: any; template_key: string }) {
    return this.fetchWithAuth('/api/dashboard/design/publish', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // QR Codes
  async getQRCodes() {
    return this.fetchWithAuth('/api/dashboard/qr-codes');
  }

  async generateQRCodes(data: { table_count?: number; base_url?: string }) {
    return this.fetchWithAuth('/api/dashboard/qr-codes/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getAnalytics(days?: number) {
    const query = days ? `?days=${days}` : '';
    return this.fetchWithAuth(`/api/dashboard/analytics${query}`);
  }

  // Templates
  async getTemplates() {
    return this.fetchWithAuth('/api/dashboard/templates');
  }

  // Staff
  async getStaff() {
    return this.fetchWithAuth('/api/dashboard/staff');
  }

  async addStaff(data: any) {
    return this.fetchWithAuth('/api/dashboard/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeStaff(id: number) {
    return this.fetchWithAuth(`/api/dashboard/staff/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload
  async uploadImage(file: File, type: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/uploads/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || `Upload failed: ${response.status}`);
    }
    return data;
  }

  // Public
  async getPublicMenu(slug: string, table?: number, visitorId?: string) {
    const query = new URLSearchParams();
    if (table) query.append('table', String(table));
    if (visitorId) query.append('visitor_id', visitorId);
    return this.fetchWithoutAuth(`/api/public/restaurants/${slug}/menu?${query}`);
  }

  async createOrder(slug: string, data: any) {
    return this.fetchWithoutAuth(`/api/public/restaurants/${slug}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrder(orderId: number) {
    return this.fetchWithoutAuth(`/api/public/orders/${orderId}`);
  }

  // Service Requests (customer facing)
  async callWaiter(slug: string, tableNumber: number) {
    return this.fetchWithoutAuth(`/api/public/${slug}/service-request`, {
      method: 'POST',
      body: JSON.stringify({ request_type: 'call_waiter', table_number: tableNumber }),
    });
  }

  async requestBill(slug: string, tableNumber: number) {
    return this.fetchWithoutAuth(`/api/public/${slug}/service-request`, {
      method: 'POST',
      body: JSON.stringify({ request_type: 'request_bill', table_number: tableNumber }),
    });
  }

  // Feedback (customer facing)
  async submitFeedback(slug: string, data: { rating: number; order_id?: number; comment?: string; customer_name?: string; table_number?: number }) {
    return this.fetchWithoutAuth(`/api/public/${slug}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Service Requests (dashboard)
  async getServiceRequests(status?: string) {
    const query = status ? `?status=${status}` : '?status=pending';
    return this.fetchWithAuth(`/api/dashboard/service-requests${query}`);
  }

  async acknowledgeServiceRequest(id: number) {
    return this.fetchWithAuth(`/api/dashboard/service-requests/${id}/acknowledge`, { method: 'PUT' });
  }

  async completeServiceRequest(id: number) {
    return this.fetchWithAuth(`/api/dashboard/service-requests/${id}/done`, { method: 'PUT' });
  }

  // Feedback (dashboard)
  async getFeedback() {
    return this.fetchWithAuth('/api/dashboard/feedback');
  }
}

export const api = new ApiService();
