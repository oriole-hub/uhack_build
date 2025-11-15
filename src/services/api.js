// services/api.js
const API_BASE_URL = 'https://rsue.devoriole.ru/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearAuth() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  /** Базовый метод для выполнения запросов */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('⚠️ API Request - no auth token found in localStorage');
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log('API Request:', url, { ...config, body: config.body });
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /** Регистрация пользователя */
  async register(userData) {
    // Преобразуем username в fullName для API
    const registrationData = {
      ...userData,
      fullName: userData.username || userData.fullName || userData.fullname,
    };
    // Удаляем username, если он был, так как API ожидает только fullName
    delete registrationData.username;
    return this.request('/auth/reg', {
      method: 'POST',
      body: registrationData,
    });
  }

  /** Подтверждение email */
  async verifyEmail(email, code) {
    return this.request('/auth/verify', {
      method: 'POST',
      body: { email, code },
    });
  }

  /** Вход в систему */
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  /** Получение данных текущего пользователя */
  async getMe() {
    return this.request('/auth/me');
  }

  // ==================== ПОЛЬЗОВАТЕЛИ ====================
  async searchUsers(orgId, extraParams = {}) {
    if (!orgId) {
      throw new Error('org_id is required for user search');
    }
    const params = new URLSearchParams();
    params.append('org_id', orgId);
    Object.entries(extraParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return this.request(`/users/search?${queryString}`);
  }

  async getUserDashboard() {
    return this.request('/users/me/dashboard');
  }

  /** Обработка приглашения (принять/отклонить) */
  async respondToInvitation(invitationId, action = 'accept') {
    if (!invitationId) {
      throw new Error('Не указан идентификатор приглашения');
    }
    // Используем эндпоинт /api/users/me/invite/{invitation_id}
    return this.request(`/users/me/invite/${invitationId}`, {
      method: 'POST',
      body: { action: action },
    });
  }

  /** Получить информацию о конкретном приглашении */
  async getInvitation(invitationId) {
    if (!invitationId) {
      throw new Error('Не указан идентификатор приглашения');
    }
    return this.request(`/users/me/invite/${invitationId}`);
  }

  // ==================== ОРГАНИЗАЦИИ ====================
  async getOrganizations() {
    // Согласно openapi.json, /orga/ возвращает список всех организаций
    // /orga/me возвращает одну организацию пользователя (MyOrga)
    try {
      const response = await this.request('/orga/');
      // Если это массив, возвращаем как есть
      if (Array.isArray(response)) {
        return response;
      }
      // Если это объект с полем organizations, возвращаем массив
      if (response && Array.isArray(response.organizations)) {
        return response.organizations;
      }
      // Если это одна организация, возвращаем массив с одним элементом
      if (response && response.id) {
        return [response];
      }
      return [];
    } catch (error) {
      console.warn('⚠️ Ошибка получения списка организаций через /orga/, пробуем /orga/me:', error.message);
      // Если /orga/ не работает (CORS или другая ошибка), пробуем /orga/me
      try {
        const myOrg = await this.request('/orga/me');
        if (myOrg && myOrg.id) {
          return [myOrg];
        }
        return [];
      } catch (meError) {
        console.error('❌ Ошибка получения организаций через /orga/me:', meError.message);
        // Возвращаем пустой массив вместо ошибки, чтобы не ломать UI
        return [];
      }
    }
  }


  async createOrganization(organizationData) {
    return this.request('/orga/create', {
      method: 'POST',
      body: organizationData,
    });
  }

  /** Получение организации по ID */
  async getOrganization(id) {
    try {
      // Получаем все организации через /orga/me
      const organizations = await this.getOrganizations();
      
      // Проверяем разные форматы ответа
      let orgList = [];
      if (Array.isArray(organizations)) {
        orgList = organizations;
      } else if (organizations && Array.isArray(organizations.organizations)) {
        orgList = organizations.organizations;
      } else if (organizations && organizations.id) {
        // Если это одна организация
        if (organizations.id === id) {
          return organizations;
        }
        orgList = [organizations];
      }
      
      // Ищем организацию по ID
      const org = orgList.find(o => o && o.id === id);
      if (org) {
        return org;
      }
      
      // Если не нашли, пробуем альтернативные эндпоинты
      try {
        return await this.request(`/orga/view/${id}`, {
          method: 'POST',
        });
      } catch (postError) {
        try {
          return await this.request(`/orga/get/${id}`);
        } catch (getError) {
          throw new Error(`Organization with id ${id} not found`);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка получения организации:', error);
      throw error;
    }
  }

  async updateOrganization(id, data) {
    return this.request(`/orga/upd/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteOrganization(id) {
    return this.request(`/orga/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== УЧАСТНИКИ ОРГАНИЗАЦИИ ====================
  async getOrganizationMembers(organizationId) {
    return this.request(`/orga/${organizationId}/members`);
  }

  async inviteMember(organizationId, email, role) {
    return this.request(`/orga/${organizationId}/invite`, {
      method: 'POST',
      body: { email, role },
    });
  }

  // ==================== ПРИГЛАШЕНИЯ ====================
  /** Создать приглашение в организацию */
  async createInvitation(organizationId, data) {
    return this.request(`/orga/${organizationId}/invite`, {
      method: 'POST',
      body: {
        identifier_type: data.identifier_type || 'email',
        identifier_value: data.identifier_value,
        role: data.role || 'User',
        expires_in_hours: data.expires_in_hours || 168
      },
    });
  }

  async removeMember(organizationId, memberId) {
    return this.request(`/orga/${organizationId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async updateMemberRole(organizationId, memberId, role) {
    return this.request(`/orga/${organizationId}/members/${memberId}`, {
      method: 'PATCH',
      body: { role },
    });
  }

  // ==================== СКЛАДЫ ====================
  async getOrganizationWarehouses(organizationId) {
    const allWarehouses = await this.getWarehouses();
    return allWarehouses.filter((warehouse) => warehouse.organization_id === organizationId);
  }

  async getWarehouses(skip = 0, limit = 100) {
    return this.request(`/sklads/?skip=${skip}&limit=${limit}`);
  }

  async chooseWarehouse(skladId) {
    return this.request('/sklads/choose', {
      method: 'POST',
      body: { sklad_id: skladId },
    });
  }

  async getWarehouse(id) {
    return this.request(`/sklads/${id}`);
  }

  async createWarehouse(warehouseData) {
    return this.request('/sklads/', {
      method: 'POST',
      body: warehouseData,
    });
  }

  async updateWarehouse(id, data) {
    return this.request(`/sklads/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteWarehouse(id) {
    return this.request(`/sklads/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== QR-КОД ОРГАНИЗАЦИИ ====================
  async generateOrganizationQrCode(organizationId, expiresIn = 86400) {
    return this.request(`/orga/create-qr/${organizationId}/?expires_in=${expiresIn}`);
  }

  async joinOrganization(qrCode) {
    const encodedQrCode = encodeURIComponent(qrCode);
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Нет токена для авторизации. Войдите в систему.');
    }

    const url = `${this.baseURL}/orga/join/${encodedQrCode}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`, // <- критично!
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  }


  // ==================== НОМЕНКЛАТУРА (РЕЕСТР) ====================
  
  /**
   * POST /api/reestr/create
   * Создать номенклатуру
   * @param {Object} data - Данные номенклатуры
   * @returns {Promise<Object>} Созданная номенклатура
   */
  async createNomenclature(data) {
    return this.request('/reestr/create', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * GET /api/reestr/list
   * Получить список номенклатур
   * @param {string|null} warehouseId - ID склада для фильтрации (необязательно)
   * @param {number} skip - Количество пропущенных записей
   * @param {number} limit - Лимит записей
   * @returns {Promise<Array>} Массив номенклатур
   */
  async getNomenclatures(warehouseId = null, skip = 0, limit = 100) {
    let endpoint = '/reestr/list';
    const params = new URLSearchParams();

    if (warehouseId) {
      params.append('warehouse_id', warehouseId);
    }
    params.append('skip', skip);
    params.append('limit', limit);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request(endpoint);
  }

  /**
   * GET /api/reestr/get/{item_id}
   * Получить номенклатуру по ID
   * @param {string} itemId - ID номенклатуры
   * @returns {Promise<Object>} Номенклатура
   */
  async getNomenclature(itemId) {
    return this.request(`/reestr/get/${itemId}`);
  }

  /**
   * PUT /api/reestr/upd/{item_id}
   * Обновить номенклатуру
   * @param {string} itemId - ID номенклатуры
   * @param {Object} data - Данные для обновления
   * @returns {Promise<Object>} Обновленная номенклатура
   */
  async updateNomenclature(itemId, data) {
    return this.request(`/reestr/upd/${itemId}`, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * DELETE /api/reestr/del/{item_id}
   * Удалить номенклатуру
   * @param {string} itemId - ID номенклатуры
   * @returns {Promise<Object>} Результат удаления
   */
  async deleteNomenclature(itemId) {
    return this.request(`/reestr/del/${itemId}`, {
      method: 'DELETE',
    });
  }

  /**
   * GET /api/reestr/search?q={query}
   * Поиск номенклатур по запросу
   * @param {string} query - Поисковый запрос
   * @returns {Promise<Array>} Массив найденных номенклатур
   */
  async searchNomenclatures(query) {
    return this.request(`/reestr/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * GET /api/reestr/search?barcode={barcode}
   * Поиск номенклатуры по штрихкоду
   * @param {string} barcode - Штрихкод
   * @returns {Promise<Array|Object>} Найденная номенклатура или массив номенклатур
   */
  async searchByBarcode(barcode) {
    return this.request(`/reestr/search?barcode=${encodeURIComponent(barcode)}`);
  }

  // ==================== ТОВАРЫ ====================
  async createProduct(productData) {
    return this.request('/products/', {
      method: 'POST',
      body: productData,
    });
  }

  async getProducts(skip = 0, limit = 100) {
    return this.request(`/products/?skip=${skip}&limit=${limit}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async updateProduct(id, data) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ДОКУМЕНТЫ ====================
  async createDocument(documentData) {
    return this.request('/documents/', {
      method: 'POST',
      body: documentData,
    });
  }

  async getDocuments(skip = 0, limit = 100) {
    return this.request(`/documents/?skip=${skip}&limit=${limit}`);
  }

  async getDocument(id) {
    return this.request(`/documents/${id}`);
  }

  async updateDocument(id, data) {
    return this.request(`/documents/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ОСТАТКИ И ДВИЖЕНИЯ ====================
  async getStock(warehouseId, productId = null) {
    const endpoint = productId
      ? `/stock/${warehouseId}/products/${productId}`
      : `/stock/${warehouseId}`;
    return this.request(endpoint);
  }

  async getStockHistory(warehouseId, productId, dateFrom, dateTo) {
    return this.request(
      `/stock/${warehouseId}/history?product_id=${productId}&date_from=${dateFrom}&date_to=${dateTo}`
    );
  }

  async adjustStock(warehouseId, adjustments) {
    return this.request(`/stock/${warehouseId}/adjust`, {
      method: 'POST',
      body: { adjustments },
    });
  }

  // ==================== СКАНИРОВАНИЕ ====================
  async startScanSession(sessionData) {
    return this.request('/scan/sessions', {
      method: 'POST',
      body: sessionData,
    });
  }

  async logScanOperation(sessionId, scanData) {
    return this.request(`/scan/sessions/${sessionId}/operations`, {
      method: 'POST',
      body: scanData,
    });
  }

  async completeScanSession(sessionId) {
    return this.request(`/scan/sessions/${sessionId}/complete`, {
      method: 'POST',
    });
  }

  // ==================== ОТЧЕТЫ ====================
  async generateReport(reportType, parameters) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: { reportType, parameters },
    });
  }

  async getInventoryReport(sklad, sklad_id) {
    const url = `${this.baseURL}/report/inventory`;
    const token = localStorage.getItem('authToken');
    
    const body = { sklad };
    // Добавляем sklad_id только если он не null и не false
    if (sklad_id !== null && sklad_id !== false && sklad_id !== undefined) {
      body.sklad_id = sklad_id;
    }

    const headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Проверяем тип ответа
    const contentType = response.headers.get('content-type');
    
    // Если это JSON, парсим как JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      // Если это строка в JSON (например, "token-string"), возвращаем строку
      if (typeof data === 'string') {
        return data;
      }
      return data;
    }
    
    // Если это текст (строка), возвращаем как строку
    return await response.text();
  }

  async downloadInventoryReport(sklad, sklad_id) {
    const url = `${this.baseURL}/report/inventory/download`;
    const token = localStorage.getItem('authToken');
    
    const body = { sklad };
    // Добавляем sklad_id только если он не null и не false
    if (sklad_id !== null && sklad_id !== false && sklad_id !== undefined) {
      body.sklad_id = sklad_id;
    }

    const headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Проверяем тип ответа
    const contentType = response.headers.get('content-type');
    
    // Если это JSON (генерация отчета с QR-кодом)
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data; // Возвращаем { message, url, qr, path, filename }
    }

    // Если это файл (blob)
    const blob = await response.blob();
    
    // Определяем имя файла из заголовка Content-Disposition или используем дефолтное
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'inventory_report.xlsx'; // дефолтное имя
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Создаем ссылку для скачивания
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, filename };
  }

  async viewInventoryReportByToken(token) {
    return this.request(`/report/inventory/view/${token}`, {
      method: 'GET',
    });
  }

  // ==================== СИНХРОНИЗАЦИЯ ====================
  async syncData(syncData) {
    return this.request('/sync/data', {
      method: 'POST',
      body: syncData,
    });
  }

  async getSyncChanges(lastSyncDate) {
    return this.request(`/sync/changes?last_sync=${lastSyncDate}`);
  }
// services/api.js - ОБНОВЛЕННЫЕ МЕТОДЫ ДЛЯ ОПЕРАЦИЙ

  // ==================== ОПЕРАЦИИ С ТОВАРАМИ ====================
  async createStockOperation(operationData) {
    return this.request('/stock/create', {
      method: 'POST',
      body: operationData,
    });
  }

  async getStockOperations(params = {}) {
    const { skip = 0, limit = 100, operation_type, nomenclature_id, sklad_id } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', Math.min(limit, 1000)); // Максимум 1000 согласно документации
    
    if (operation_type) queryParams.append('operation_type', operation_type);
    if (nomenclature_id) queryParams.append('nomenclature_id', nomenclature_id);
    if (sklad_id) queryParams.append('sklad_id', sklad_id);
    
    return this.request(`/stock/all?${queryParams.toString()}`);
  }

  async getStockOperation(operationId) {
    return this.request(`/stock/${operationId}`);
  }

  // ==================== ДОКУМЕНТЫ СКЛАДА ====================
  
  /**
   * Создать документ склада
   * POST /api/docsklad/create
   * @param {Object} data - Данные документа
   * @param {string[]} data.sklad_ids - Массив UUID складов
   * @param {string} data.doc_type - Тип документа: 'outgoing' | 'incoming' | 'inventory'
   * @param {string} data.number - Номер документа
   * @param {string} [data.description] - Описание документа (необязательно)
   * @param {Object} [data.address_from] - Адрес отправки (для отходных документов)
   * @param {string} [data.address_from.country] - Страна
   * @param {string} [data.address_from.city] - Город
   * @param {string} [data.address_from.street] - Улица
   * @param {string} [data.address_from.postalCode] - Почтовый индекс
   * @param {string} [data.address_from.building] - Здание
   * @param {Object} [data.address_to] - Адрес назначения (для приходных документов)
   * @param {string} [data.address_to.country] - Страна
   * @param {string} [data.address_to.city] - Город
   * @param {string} [data.address_to.street] - Улица
   * @param {string} [data.address_to.postalCode] - Почтовый индекс
   * @param {string} [data.address_to.building] - Здание
   * @returns {Promise<Object>} Созданный документ
   */
  async createSkladDocument(data) {
    return this.request('/docsklad/create', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Получить список документов склада
   * @param {string} [skladId] - UUID склада для фильтрации (необязательно)
   * @returns {Promise<Array>} Массив документов
   */
  async getSkladDocuments(skladId = null) {
    const endpoint = skladId 
      ? `/docsklad/list?sklad_id=${skladId}`
      : '/docsklad/list';
    return this.request(endpoint);
  }

  /**
   * Получить документ по ID
   * @param {string} docId - UUID документа
   * @returns {Promise<Object>} Документ
   */
  async getSkladDocument(docId) {
    return this.request(`/docsklad/${docId}`);
  }

  /**
   * Изменить документ
   * PUT /api/docsklad/{doc_id}
   * @param {string} docId - UUID документа
   * @param {Object} data - Данные для обновления (все поля опциональны)
   * @param {string[]} [data.sklad_ids] - Массив UUID складов
   * @param {string} [data.doc_type] - Тип документа: 'outgoing' | 'incoming' | 'inventory'
   * @param {string} [data.number] - Номер документа
   * @param {string} [data.description] - Описание документа
   * @param {Object} [data.address_from] - Адрес отправки
   * @param {Object} [data.address_to] - Адрес назначения
   * @returns {Promise<Object>} Обновленный документ
   */
  async updateSkladDocument(docId, data) {
    return this.request(`/docsklad/${docId}`, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Удалить документ
   * @param {string} docId - UUID документа
   * @returns {Promise<Object>} Результат удаления
   */
  async deleteSkladDocument(docId) {
    return this.request(`/docsklad/${docId}`, {
      method: 'DELETE',
    });
  }

  // ==================== НОМЕНКЛАТУРЫ В ДОКУМЕНТАХ СКЛАДА ====================
  
  /**
   * Добавить номенклатуру в документ
   * POST /api/docsklad/{doc_id}/items
   * @param {string} docId - UUID документа
   * @param {Object} data - Данные номенклатуры
   * @param {string} data.nomenclature_id - ID номенклатуры (обязательно)
   * @param {string} [data.name] - Название товара (опционально, берется из номенклатуры)
   * @param {string} [data.unit] - Единица измерения (опционально, берется из номенклатуры)
   * @param {Object} [data.packaging] - Упаковка (опционально)
   * @param {string} data.packaging.name - Название упаковки
   * @param {number} data.packaging.base_units - Количество базовых единиц
   * @param {string} [data.packaging.barcode] - Штрихкод упаковки
   * @param {number} data.quantity_documental - Количество документальное (>= 0, обязательно)
   * @param {number} [data.quantity_actual] - Количество фактическое (>= 0, опционально)
   * @returns {Promise<Object>} Созданная номенклатура в документе
   */
  async addDocumentItem(docId, data) {
    return this.request(`/docsklad/${docId}/items`, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Получить все номенклатуры документа
   * GET /api/docsklad/{doc_id}/items?item_id={uuid}
   * @param {string} docId - UUID документа
   * @param {string} [itemId] - UUID номенклатуры для фильтрации (опционально)
   * @returns {Promise<Array>} Массив номенклатур документа
   */
  async getDocumentItems(docId, itemId = null) {
    const endpoint = itemId 
      ? `/docsklad/${docId}/items?item_id=${itemId}`
      : `/docsklad/${docId}/items`;
    return this.request(endpoint);
  }

  /**
   * Изменить номенклатуру в документе
   * PUT /api/docsklad/items/{item_id}
   * @param {string} itemId - UUID номенклатуры в документе
   * @param {Object} data - Данные для обновления (все поля опциональны)
   * @param {string} [data.nomenclature_id] - ID новой номенклатуры
   * @param {string} [data.name] - Название товара
   * @param {string} [data.unit] - Единица измерения
   * @param {Object} [data.packaging] - Упаковка
   * @param {number} [data.quantity_documental] - Количество документальное
   * @param {number} [data.quantity_actual] - Количество фактическое
   * @returns {Promise<Object>} Обновленная номенклатура в документе
   */
  async updateDocumentItem(itemId, data) {
    return this.request(`/docsklad/items/${itemId}`, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Удалить номенклатуру из документа
   * DELETE /api/docsklad/items/{item_id}
   * @param {string} itemId - UUID номенклатуры в документе
   * @returns {Promise<Object>} Результат удаления
   */
  async deleteDocumentItem(itemId) {
    return this.request(`/docsklad/items/${itemId}`, {
      method: 'DELETE',
    });
  }

}


export const apiService = new ApiService();
