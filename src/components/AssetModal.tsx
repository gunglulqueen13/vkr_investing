import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { Asset as ApiAsset, portfolioApi } from '../services/api';

interface Props {
    visible: boolean;
    initialData?: Asset;
    onCancel: () => void;
    onSubmit: (asset: ApiAsset) => void;
}

type TickerInfo = { ticker: string; name: string; type: 'stock' | 'bond' | 'etf' };

const AssetModal: React.FC<Props> = ({ visible, initialData, onCancel, onSubmit }) => {
    const [form, setForm] = useState<Asset>(initialData || {
        id: '',
        ticker: '',
        name: '',
        type: 'stock',
        purchasePrice: 0,
        currentPrice: 0,
        quantity: 1,
        purchaseDate: new Date().toISOString().split('T')[0],
    });
    const [tickersList, setTickersList] = useState<TickerInfo[]>([]);
    const [query, setQuery] = useState('');
    const [showSug, setShowSug] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const respShares = await fetch(
                    'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME'
                );
                const dataShares = await respShares.json();
                const shares = dataShares.securities.data.map((i: string[]) => ({
                    ticker: i[0], name: i[1], type: 'stock' as const
                }));

                const respCorpBonds = await fetch(
                    'https://iss.moex.com/iss/engines/stock/markets/bonds/boards/TQCB/securities.json?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME'
                );
                const dataCorpBonds = await respCorpBonds.json();
                const corpBonds = dataCorpBonds.securities.data.map((i: string[]) => ({
                    ticker: i[0], name: i[1], type: 'bond' as const
                }));

                const respGovBonds = await fetch(
                    'https://iss.moex.com/iss/engines/stock/markets/bonds/boards/TQOB/securities.json?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME'
                );
                const dataGovBonds = await respGovBonds.json();
                const govBonds = dataGovBonds.securities.data.map((i: string[]) => ({
                    ticker: i[0], name: i[1], type: 'bond' as const
                }));

                const respEtf = await fetch(
                    'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQTF/securities.json?iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME'
                );
                const dataEtf = await respEtf.json();
                const etf = dataEtf.securities.data.map((i: string[]) => ({
                    ticker: i[0], name: i[1], type: 'etf' as const
                }));

                setTickersList([...shares, ...corpBonds, ...govBonds, ...etf]);
            } catch (e) {
                console.error(e)
            }
        };

        fetchList();
    }, []);

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
            setQuery(initialData.ticker);
        }
    }, [initialData]);

    if (!visible) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ticker: form.ticker,
            name: form.name,
            type: form.type,
            purchase_price: form.purchasePrice,
            quantity: form.quantity,
            purchase_date: form.purchaseDate,
        };
        if (initialData) {
            portfolioApi.updateAsset(form.id, payload).then(r => {
                onSubmit(r.data);
            });
        } else {
            portfolioApi.addAsset(payload).then(r => {
                onSubmit(r.data);
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                    {initialData ? 'Редактировать актив' : 'Добавить новый актив'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label htmlFor="ticker" className="block text-sm font-medium">Тикер или название</label>
                        <input
                            id="ticker"
                            type="text"
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                                setForm({ ...form, ticker: e.target.value });
                                setShowSug(true);
                            }}
                            onFocus={() => query && setShowSug(true)}
                            onBlur={() => setTimeout(() => setShowSug(false), 150)}
                            className="mt-1 w-full border rounded p-2"
                            required
                        />
                        {showSug && (
                            <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-auto">
                                {tickersList
                                    .filter(
                                        t =>
                                            t.ticker.toLowerCase().includes(query.toLowerCase()) ||
                                            t.name.toLowerCase().includes(query.toLowerCase())
                                    )
                                    .slice(0, 10)
                                    .map(t => (
                                        <li
                                            key={t.ticker}
                                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                            onMouseDown={() => {
                                                setForm({ ...form, ticker: t.ticker, name: t.name, type: t.type });
                                                setQuery(t.ticker);
                                                setShowSug(false);
                                            }}
                                        >
                                            <div>
                                                <div className="font-medium">{t.ticker}</div>
                                                <div className="text-xs text-gray-500">{t.name}</div>
                                            </div>
                                            <span className="inline-block text-xs rounded px-2 py-0.5 bg-gray-200">
                                                {t.type === 'stock' ? 'Акция' : t.type === 'bond' ? 'Облигация' : 'ETF'}
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">Название</label>
                        <input
                            id="name"
                            type="text"
                            value={form.name}
                            readOnly
                            className="mt-1 w-full border rounded p-2 bg-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium">Тип актива</label>
                        <select
                            id="type"
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value as 'stock' | 'bond' | 'etf' })}
                            className="mt-1 w-full border rounded p-2"
                            required
                        >
                            <option value="stock">Акция</option>
                            <option value="bond">Облигация</option>
                            <option value="etf">ETF</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="purchasePrice" className="block text-sm font-medium">Цена покупки (₽)</label>
                        <input
                            id="purchasePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.purchasePrice}
                            onChange={e =>
                                setForm({ ...form, purchasePrice: parseFloat(e.target.value) })
                            }
                            className="mt-1 w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium">Количество</label>
                        <input
                            id="quantity"
                            type="number"
                            min="1"
                            value={form.quantity}
                            onChange={e =>
                                setForm({ ...form, quantity: parseInt(e.target.value, 10) })
                            }
                            className="mt-1 w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium">Дата покупки</label>
                        <input
                            id="purchaseDate"
                            type="date"
                            value={form.purchaseDate}
                            onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
                            className="mt-1 w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-white border rounded"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            {initialData ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetModal;