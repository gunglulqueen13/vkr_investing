import React from 'react';
import { Asset } from '../types';
import { Edit2, Trash2, Minus, TrendingUp, TrendingDown, Tag } from 'lucide-react';

interface Props {
  assets: Asset[];
  recommendations: Record<string, string>;
  onAdd: () => void;
  onEdit: (asset: Asset) => void;
  onSell: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const recommendationIcon = (r?: string) => {
  if (!r) return null;
  const up = <TrendingUp className="text-green-500" size={16} />;
  const down = <TrendingDown className="text-red-500" size={16} />;
  const hold = <Minus className="text-yellow-500" size={16} />;
  const rec = r.toLowerCase();
  if (rec.includes('покупать') || rec.includes('buy')) return up;
  if (rec.includes('продавать') || rec.includes('sell')) return down;
  return hold;
};

const AssetsTable: React.FC<Props> = ({
  assets,
  recommendations,
  onAdd,
  onEdit,
  onSell,
  onDelete
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-8">
    {/* Заголовок */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Мои активы</h2>
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
      >
        Добавить актив
      </button>
    </div>

    {/* Таблица */}
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              'Тикер',
              'Название',
              'Тип',
              'Цена покупки',
              'Дата покупки',
              'Текущая цена',
              'Цена продажи',
              'Дата продажи',
              'Количество',
              'Стоимость',
              'Дивиденды/Купоны',
              'Доходность',
              'Рекомендация',
              'Действия'
            ].map(h => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assets.map(a => {
            const rec = recommendations[`RUS-${a.ticker}`];
            const qty = Number(a.quantity);
            const totalPurchase = a.purchasePrice * qty;
            const totalIncome = a.income ?? 0;
            const isSold = !!a.saleDate && !!a.salePrice;

            const effectivePrice = isSold ? a.salePrice! : a.currentPrice;
            const totalEffective = effectivePrice * qty;
            const profit = totalEffective + totalIncome - totalPurchase;
            const profitPct = ((profit / totalPurchase) * 100).toFixed(2);

            return (
              <tr
                key={a.id}
                className={isSold ? 'opacity-60 bg-gray-50' : undefined}
              >
                <td className="px-6 py-4 font-medium">{a.ticker}</td>
                <td className="px-6 py-4">{a.name}</td>
                <td className="px-6 py-4">
                  {a.type === 'stock' ? 'Акция'
                    : a.type === 'bond' ? 'Облигация'
                      : 'ETF'}
                </td>
                <td className="px-6 py-4">{a.purchasePrice && a.purchasePrice.toLocaleString('ru-RU')} ₽</td>
                <td className="px-6 py-4">{a.purchaseDate && new Date(a.purchaseDate).toLocaleDateString('ru-RU')}</td>
                <td className="px-6 py-4">{effectivePrice && effectivePrice.toLocaleString('ru-RU')} ₽</td>
                <td className="px-6 py-4">
                  {isSold ? a.salePrice!.toLocaleString('ru-RU') + ' ₽' : '—'}
                </td>
                <td className="px-6 py-4">
                  {isSold ? new Date(a.saleDate!).toLocaleDateString('ru-RU') : '—'}
                </td>
                <td className="px-6 py-4">{qty}</td>
                <td className="px-6 py-4 font-medium">
                  {totalEffective.toLocaleString('ru-RU')} ₽
                </td>
                <td className="px-6 py-4 font-medium">{totalIncome.toLocaleString('ru-RU')} ₽</td>
                <td className={`px-6 py-4 ${+profitPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitPct}% ({profit.toLocaleString('ru-RU')} ₽)
                </td>
                <td className="px-6 py-4 flex items-center gap-1">
                  {recommendationIcon(rec)}<span>{rec || '—'}</span>
                </td>
                {/* Скрываем ячейку действий для проданных */}
                <td className="px-6 py-4">
                  {isSold ? (
                    <span className="text-gray-500 italic">Актив продан</span>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => onSell(a)}
                        className="text-green-600 hover:text-green-900 mr-2 flex items-center"
                        aria-label="Продать"
                      >
                        <Tag size={16} /> Продать
                      </button>
                      <button
                        onClick={() => onEdit(a)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        aria-label="Редактировать"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Вы уверены, что хотите удалить этот актив?')) {
                            onDelete(a.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        aria-label="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {assets.length === 0 && (
      <div className="text-center py-8 text-gray-500">Нет активов</div>
    )}
  </div>
);

export default AssetsTable;
