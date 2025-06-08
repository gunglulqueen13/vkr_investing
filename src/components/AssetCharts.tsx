import React from 'react';
import { Asset } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

interface Props { assets: Asset[]; }

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Генерация пастельного цвета по индексу
const pastelColor = (index: number) => {
  const hue = (index * 47) % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

const AssetCharts: React.FC<Props> = ({ assets }) => {
  // Исключаем проданные активы для круговой диаграммы
  const activeAssets = assets.filter(a => !a.saleDate);

  const pieData = ['stock', 'bond', 'etf']
    .map(type => ({
      name: { stock: 'Акции', bond: 'Облигации', etf: 'ETF' }[type],
      value: activeAssets
        .filter(a => a.type === type)
        .reduce((sum, a) => sum + a.currentPrice * a.quantity, 0)
    }))
    .filter(item => item.value > 0);

  const barData = assets.map((a, index) => {
    const isSold = !!a.saleDate;
    const income = a.income ?? 0;
    const cost = a.purchasePrice * a.quantity;

    const profit = isSold
      ? ((a.salePrice ?? 0) - a.purchasePrice) * a.quantity
      : (a.currentPrice - a.purchasePrice) * a.quantity;

    const totalReturn = cost > 0
      ? ((profit + income) / cost) * 100
      : 0;

    return {
      name: a.ticker,
      Доходность: +totalReturn.toFixed(2),
      fill: pastelColor(index)
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Распределение активов</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={80}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={val => `${Number(val).toLocaleString('ru-RU')} ₽`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Доходность активов</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit="%" />
            <Tooltip formatter={val => `${val}%`} />
            <Legend />
            <Bar dataKey="Доходность">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetCharts;
