import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

interface Bond {
  isin: string;
  name: string;
  current_price: number;
  nkd: number;
  face_value: number;
  coupon_profit: number;
  mat_date: string;
  ytm: number;
  days_to_maturity: number;
}

const BondScreenerPage: React.FC = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [filteredBonds, setFilteredBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Bond>('ytm');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minYTM: 0,
    maxYTM: 100,
    minCouponProfit: 0,
    maxCouponProfit: 100,
    minMaturityDate: '',
    maxMaturityDate: '',
  });

  useEffect(() => {
    fetch('/api/bonds')
      .then(res => res.json())
      .then((data: Bond[]) => {
        setBonds(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = bonds.filter(b =>
      b.ytm >= filters.minYTM &&
      b.ytm <= filters.maxYTM &&
      b.coupon_profit >= filters.minCouponProfit &&
      b.coupon_profit <= filters.maxCouponProfit &&
      (!filters.minMaturityDate || new Date(b.mat_date) >= new Date(filters.minMaturityDate)) &&
      (!filters.maxMaturityDate || new Date(b.mat_date) <= new Date(filters.maxMaturityDate)) &&
      (b.isin.toLowerCase().includes(searchTerm.toLowerCase()) ||
       b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    result.sort((a, b) => {
      const fa = a[sortField], fb = b[sortField];
      if (typeof fa === 'string') {
        return sortDirection === 'asc'
          ? String(fa).localeCompare(String(fb))
          : String(fb).localeCompare(String(fa));
      }
      return sortDirection === 'asc' ? (fa as number) - (fb as number) : (fb as number) - (fa as number);
    });

    setFilteredBonds(result);
  }, [bonds, searchTerm, sortField, sortDirection, filters]);

  const handleSort = (field: keyof Bond) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Загрузка облигаций…</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Скринер облигаций</h1>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <RefreshCw size={18} className="mr-2" /> Обновить
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex flex-wrap justify-between items-center">
          <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по ISIN или названию"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border rounded focus:ring focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Filter size={18} className="mr-1" />
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm">YTM от (%)</label>
              <input
                type="number"
                value={filters.minYTM}
                onChange={e => setFilters(f => ({ ...f, minYTM: +e.target.value }))}
                className="mt-1 w-full border rounded p-1"
              />
            </div>
            <div>
              <label className="block text-sm">YTM до (%)</label>
              <input
                type="number"
                value={filters.maxYTM}
                onChange={e => setFilters(f => ({ ...f, maxYTM: +e.target.value }))}
                className="mt-1 w-full border rounded p-1"
              />
            </div>
            <div>
              <label className="block text-sm">Купон от (%)</label>
              <input
                type="number"
                value={filters.minCouponProfit}
                onChange={e => setFilters(f => ({ ...f, minCouponProfit: +e.target.value }))}
                className="mt-1 w-full border rounded p-1"
              />
            </div>
            <div>
              <label className="block text-sm">Купон до (%)</label>
              <input
                type="number"
                value={filters.maxCouponProfit}
                onChange={e => setFilters(f => ({ ...f, maxCouponProfit: +e.target.value }))}
                className="mt-1 w-full border rounded p-1"
              />
            </div>
            <div>
              <label className="block text-sm">Погашение от</label>
              <input
                type="date"
                value={filters.minMaturityDate}
                onChange={e => setFilters(f => ({ ...f, minMaturityDate: e.target.value }))}
                className="mt-1 w-full border rounded p-1"
              />
            </div>
            <div>
              <label className="block text-sm">Погашение до</label>
              <input
                type="date"
                value={filters.maxMaturityDate}
                onChange={e => setFilters(f => ({ ...f, maxMaturityDate: e.target.value }))}
                className="mt-1 w-full border rounded p-1"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'isin', label: 'ISIN' },
                { key: 'name', label: 'Название' },
                { key: 'current_price', label: 'Цена' },
                { key: 'nkd', label: 'НКД' },
                { key: 'face_value', label: 'Номинал' },
                { key: 'coupon_profit', label: 'Текущая купонная доходность (%)' },
                { key: 'ytm', label: 'YTM (%)' },
                { key: 'mat_date', label: 'Дата погашения' },
                { key: 'days_to_maturity', label: 'Осталось дней' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as keyof Bond)}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-600 cursor-pointer"
                >
                  <div className="flex items-center">
                    {label}
                    {sortField === key && (
                      sortDirection === 'asc'
                        ? <ArrowUp className="ml-1 w-4 h-4" />
                        : <ArrowDown className="ml-1 w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBonds.map(bond => (
              <tr key={bond.isin}>
                <td className="px-4 py-2">{bond.isin}</td>
                <td className="px-4 py-2">{bond.name}</td>
                <td className="px-4 py-2">{bond.current_price.toFixed(2)}</td>
                <td className="px-4 py-2">{bond.nkd.toFixed(2)}</td>
                <td className="px-4 py-2">{bond.face_value}</td>
                <td className="px-4 py-2">{bond.coupon_profit.toFixed(2)}</td>
                <td className="px-4 py-2">{bond.ytm.toFixed(2)}</td>
                <td className="px-4 py-2">{bond.mat_date}</td>
                <td className="px-4 py-2">{bond.days_to_maturity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BondScreenerPage;
