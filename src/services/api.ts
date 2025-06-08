import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Создаём экземпляр axios с базовым URL и заголовком JSON
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Интерцептор для добавления токена к каждому запросу
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Интерцептор для обработки ответов и ошибок (например, 401)
api.interceptors.response.use(
  res => res,
  err => {
    console.log('← Response error:', err.response?.status, err.response?.config.url);
    if (err.response?.status === 401) {
      console.log('  — token expired or invalid, logging out');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// Типизация активов
export interface Asset {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  type: 'stock' | 'bond' | 'etf';
  purchase_price: number;
  current_price: number;
  quantity: number;
  purchase_date: string;
  sale_date?: string;
  sale_price?: number;
  created_at: string;
  updated_at: string;
}

// Типизация облигаций
export interface Bond {
  id: string;
  ticker: string;
  name: string;
  issuer: string;
  maturity_date: string;
  coupon_rate: number;
  price: number;
  ytm: number;
  rating: string;
  face_value: number;
}

// Методы для работы с портфелем активов
export const portfolioApi = {
  // Получить все активы пользователя
  getAssets: () => api.get<Asset[]>('/portfolio/assets'),

  addAsset: (asset: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_price' | 'sale_date' | 'sale_price'>) =>
    api.post<Asset>('/portfolio/assets', asset),

  // Обновить существующий актив, включая возможность задания sale_date и sale_price
 updateAsset: (
    id: string,
    asset: {
      ticker: string;
      name: string;
      type: 'stock' | 'bond' | 'etf';
      purchase_price: number;
      quantity: number;
      purchase_date: string;
    }
  ) => api.put<Asset>(`/portfolio/assets/${id}`, asset),

  sellAsset: (
    id: string,
    asset: Partial<Asset> & {
      sale_date?: string;
      sale_price?: number;
    }
  ) => api.put<Asset>(`/portfolio/assets/${id}/sell`, asset),

  // Удалить актив
  deleteAsset: (id: string) => api.delete(`/portfolio/assets/${id}`),

  // Получить статистику портфеля
  getStatistics: () => api.get('/portfolio/statistics'),
};

// Методы для получения информации по облигациям
export interface BondFilters {
  minYTM?: number;
  maxYTM?: number;
  minCouponRate?: number;
  maxCouponRate?: number;
  minMaturityDate?: string;
  maxMaturityDate?: string;
  ratings?: string[];
  search?: string;
}

export const bondsApi = {
  getBonds: (filters?: BondFilters) =>
    api.get<Bond[]>('/bonds', { params: filters }),

  getBondByTicker: (ticker: string) =>
    api.get<Bond>(`/bonds/${ticker}`),
};

export default api;
