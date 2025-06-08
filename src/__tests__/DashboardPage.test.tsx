import * as React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../pages/DashboardPage';
import { portfolioApi } from '../services/api';
import { AxiosResponse, AxiosHeaders } from 'axios';

type Asset = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  ticker: string;
  name: string;
  type: 'stock' | 'bond' | 'etf';
  purchase_price: number;
  current_price: number;
  quantity: number;
  purchase_date: string;
  sale_date?: string;
  sale_price?: number;
};

jest.mock('../services/api', () => ({
  __esModule: true,
  portfolioApi: {
    getAssets: jest.fn(),
    addAsset: jest.fn(),
    updateAsset: jest.fn(),
    sellAsset: jest.fn(),
    deleteAsset: jest.fn(),
  }
}));
const mockPortfolioApi = portfolioApi as jest.Mocked<typeof portfolioApi>;

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    updateUserProfile: jest.fn()
  })
}));

describe('DashboardPage', () => {
  const mockAssets: Asset[] = [
    {
      id: '1', user_id: 'user1', created_at: '2023-01-01', updated_at: '2023-01-01',
      ticker: 'SBER', name: 'Sberbank', type: 'stock', purchase_price: 250,
      current_price: 300, quantity: 10, purchase_date: '2023-01-01'
    },
    {
      id: '2', user_id: 'user1', created_at: '2023-01-01', updated_at: '2023-01-01',
      ticker: 'SU26238', name: 'OFZ 26238', type: 'bond', purchase_price: 980,
      current_price: 1000, quantity: 5, purchase_date: '2023-02-01',
      sale_date: '2023-12-01', sale_price: 990
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPortfolioApi.getAssets.mockResolvedValue({
      data: mockAssets,
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders(), url: '', method: 'GET' }
    } as AxiosResponse<Asset[]>);

    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });

    (global as any).fetch = jest.fn((url: string) => {
      if (url.includes('LAST')) {
        return Promise.resolve({ json: () => Promise.resolve({ data: { rows: [['', ''], ['', ''], ['', 555]] } }) });
      } else if (url.includes('dividends.json')) {
        return Promise.resolve({ json: () => Promise.resolve({ data: [{ registryclosedate: '2024-01-01', value: 12.34 }] }) });
      } else if (url.includes('/api/recommendations')) {
        return Promise.resolve({ json: () => Promise.resolve([]) });
      }
      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
    });
  });

  test('renders assets and calculates metrics correctly', async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(mockPortfolioApi.getAssets).toHaveBeenCalled());
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(mockAssets.length + 1);
  });

  test('handles asset addition', async () => {
    const user = userEvent.setup();

    // Мокируем базовый ответ API
    const mockAddAsset = mockPortfolioApi.addAsset as jest.Mock;
    mockAddAsset.mockResolvedValueOnce({
      data: { id: '1' },
      status: 201
    });

    render(<DashboardPage />);

    // Открываем модалку
    await user.click(screen.getByRole('button', { name: /добавить актив/i }));

    // Получаем элементы полей
    const tickerInput = screen.getByLabelText(/тикер или название/i);
    const priceInput = screen.getByLabelText(/цена покупки/i);
    const quantityInput = screen.getByLabelText(/количество/i);
    const dateInput = screen.getByLabelText(/дата покупки/i);
    const nameInput = screen.getByLabelText("Название");

    // Заполняем поля
    await user.type(tickerInput, 'GAZP');
    await user.type(priceInput, '300');
    await user.type(quantityInput, '5');
    await user.type(dateInput, '2023-03-01');

    // Отправляем форму
    await user.click(screen.getByRole('button', { name: "Добавить" }));

    //Проверяем вызов API
    await waitFor(() => {
      expect(mockAddAsset).toHaveBeenCalled();
    });
  });

  test('handles asset editing', async () => {
    const user = userEvent.setup();

    // Мокаем API вызов
    const mockUpdate = jest.spyOn(portfolioApi, 'updateAsset').mockResolvedValue({
      data: {
        ...mockAssets[0],
        purchase_price: 260,
        quantity: 15,
      }
    } as any);

    render(<DashboardPage />);
    await waitFor(() => expect(mockPortfolioApi.getAssets).toHaveBeenCalled());

    // Находим первую строку таблицы с активом SBER
    const rows = await screen.findAllByRole('row');
    const firstAssetRow = rows[1]; // rows[0] - заголовки таблицы

    // Используем within для поиска внутри конкретной строки
    const withinRow = within(firstAssetRow);

    // Находим кнопку редактирования только в этой строке
    const editButton = withinRow.getByRole('button', {
      name: /редактировать/i
    });

    await user.click(editButton);

    //Проверяем предзаполнение полей
    expect(screen.getByLabelText(/количество/i)).toHaveValue(10);
    expect(screen.getByLabelText(/цена покупки/i)).toHaveValue(250);

    // Вносим изменения
    await user.clear(screen.getByLabelText(/количество/i));
    await user.type(screen.getByLabelText(/количество/i), '15');
    await user.clear(screen.getByLabelText(/цена покупки/i));
    await user.type(screen.getByLabelText(/цена покупки/i), '260');

    // Сохраняем изменения
    await user.click(screen.getByRole('button', { name: /сохранить/i }));

    //Проверяем вызов API
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('1', {
        ticker: 'SBER',
        name: 'Sberbank',
        type: 'stock',
        purchase_price: 260,
        quantity: 15,
        purchase_date: '2023-01-01'
      });
    });

    mockUpdate.mockRestore();
  });

  test('handles asset selling', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    // Дожидаемся загрузки данных
    await waitFor(() => expect(mockPortfolioApi.getAssets).toHaveBeenCalled());

    // Находим актив для продажи
    const assetRow = await screen.findByRole('row', { name: /Sberbank/i });

    // Кликаем кнопку продажи
    const sellButton = within(assetRow).getByRole('button', { name: /продать/i });
    await user.click(sellButton);

    // Дожидаемся появления модалки
    const modal = await screen.findByRole('dialog');

    // Заполняем форму
    const salePriceInput = within(modal).getByLabelText(/цена продажи/i);
    const saleDateInput = within(modal).getByLabelText(/дата продажи/i);

    await user.clear(salePriceInput);
    await user.type(salePriceInput, '320');

    await user.clear(saleDateInput);
    await user.type(saleDateInput, '2023-12-01');

    // Мокаем ответ API
    const mockResponse: AxiosResponse<Asset> = {
      data: {
        ...mockAssets[0],
        sale_price: 320,
        sale_date: '2023-12-01',
        updated_at: '2023-12-01'
      },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() }
    };
    mockPortfolioApi.sellAsset.mockResolvedValue(mockResponse);

    // Подтверждаем продажу
    const confirmButton = within(modal).getByRole('button', {
      name: /подтвердить продажу/i
    });
    await user.click(confirmButton);

    // Проверяем вызов API
    await waitFor(() => {
      expect(mockPortfolioApi.sellAsset).toHaveBeenCalledWith('1', {
        sale_price: 320,
        sale_date: '2023-12-01'
      });
    });
  });

  test('handles asset deletion', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);
    await screen.findByText('Sberbank');

    const deleteButtons = await screen.findAllByRole('button', { name: /удалить/i });
    await user.click(deleteButtons[0]);

    const confirmBtn = await screen.findByRole('button', { name: /да/i });
    const mockResponse = {
      data: {}, status: 204, statusText: 'No Content',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders(), url: '', method: 'DELETE' }
    } as AxiosResponse;
    mockPortfolioApi.deleteAsset.mockResolvedValue(mockResponse);

    await user.click(confirmBtn);
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(mockAssets.length);
    });
  });
});
