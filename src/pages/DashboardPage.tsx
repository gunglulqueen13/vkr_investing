import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatsCards from '../components/StatsCards';
import AssetCharts from '../components/AssetCharts';
import AssetsTable from '../components/AssetsTable';
import AssetModal from '../components/AssetModal';
import ProfileModal from '../components/ProfileModal';
import SellModal from '../components/SellModal';
import { portfolioApi, Asset as ApiAsset } from '../services/api';
import { Asset } from '../types';

const DashboardPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const recFetched = useRef(false);
  const [sellingAsset, setSellingAsset] = useState<Asset | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);


  useEffect(() => {
    portfolioApi.getAssets().then(resp => {
      const baseAssets: Asset[] = resp.data.map(a => ({
        id: a.id,
        ticker: a.ticker,
        name: a.name,
        type: a.type,
        purchasePrice: a.purchase_price,
        currentPrice: a.current_price ?? a.purchase_price,
        quantity: a.quantity,
        purchaseDate: a.purchase_date,
        salePrice: a.sale_price,
        saleDate: a.sale_date,
      }));

      setAssets(baseAssets);

      baseAssets.forEach(async asset => {
        const engine = 'stock';
        const market = asset.type === 'bond' ? 'bonds' : 'shares';

        try {
          let currentPrice = asset.currentPrice;
          if (asset.type === 'bond') {
            const priceResp = await fetch(`https://iss.moex.com/iss/engines/${engine}/markets/${market}/securities/${asset.ticker}.json`);
            const priceData = await priceResp.json();
            const currentPriceProcent = priceData.securities.data[0][8]
            const faceValue = priceData.securities.data[0][10]

            currentPrice = currentPriceProcent / 100 * faceValue

          }


          else if (asset.type === "stock") {
            const priceResp = await fetch(
              `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${asset.ticker}.json?iss.meta=off&iss.only=marketdata&marketdata.columns=SECID,LAST`
            );
            const priceData = await priceResp.json();
            const rows = priceData?.marketdata?.data ?? [];

            if (Array.isArray(rows) && rows[rows.length - 1] && typeof rows[rows.length - 1][1] === 'number') {
              currentPrice = rows[rows.length - 1][1];
            } else {
              console.warn(`LAST не найден для ${asset.ticker}`);
            }
          }

          else if (asset.type === "etf") {
            const priceResp = await fetch(
              `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${asset.ticker}.json?iss.meta=off&iss.only=marketdata&marketdata.columns=MARKETPRICE`
            );
            const priceData = await priceResp.json();

            currentPrice = priceData.marketdata.data[0][0]
          }



          let income = 0;

          const corporateType = asset.type === 'stock' ? 'dividends' : asset.type === 'bond' ? 'coupons' : null;

          if (corporateType) {
            try {
              let url = '';

              if (corporateType === 'dividends') {
                url = `https://iss.moex.com/iss/securities/${asset.ticker}/dividends.json?iss.meta=off&iss.only=dividends&dividends.columns=registryclosedate,value`;

                const incomeResp = await fetch(url);
                const incomeData = await incomeResp.json();
                const data = incomeData?.[corporateType]?.data ?? [];

                const purchaseDate = new Date(asset.purchaseDate);
                const now = new Date();

                income = data
                  .filter((row: any[]) => {
                    const dateStr = row[0];
                    const value = parseFloat(row[1]);
                    const date = dateStr ? new Date(dateStr) : null;
                    return date && date >= purchaseDate && date <= now && !isNaN(value);
                  })
                  .map((row: any[]) => parseFloat(row[1]) || 0)
                  .reduce((sum: number, val: number) => sum + val, 0);

                // Умножаем на количество
                income *= asset.quantity;
              }

              if (corporateType === 'coupons') {
                const url = `https://iss.moex.com/iss/engines/stock/markets/bonds/securities/${asset.ticker}/coupons.json`;

                const incomeResp = await fetch(url);
                const incomeData = await incomeResp.json();

                const couponInfo = incomeData.securities?.data?.[0]; // первая запись с параметрами облигации

                if (couponInfo) {
                  const couponValue = parseFloat(couponInfo[5]); // COUPONVALUE
                  const nextCouponDateStr = couponInfo[6]; // NEXTCOUPON
                  const purchaseDate = new Date(asset.purchaseDate);
                  const now = new Date();

                  // Можно приблизительно считать, что купоны платятся с постоянным периодом:
                  const couponPeriodDays = parseInt(couponInfo[15], 10); // COUPONPERIOD в днях

                  // Считаем количество купонных периодов с момента покупки до текущей даты:
                  const periods = Math.floor((now.getTime() - purchaseDate.getTime()) / (couponPeriodDays * 24 * 3600 * 1000));

                  // Приблизительный доход:
                  income = couponValue * periods * asset.quantity;
                }
              }




            } catch (e) {
              console.warn(`Ошибка при получении ${corporateType} для ${asset.ticker}:`, e);
            }
          }

          setAssets(prev =>
            prev.map(a =>
              a.id === asset.id
                ? { ...a, currentPrice, income }
                : a
            )
          );

        } catch (e) {
          console.error(`Ошибка при загрузке данных для ${asset.ticker}:`, e);
        }
      });
    });
  }, []);

  const handleSell = (asset: Asset) => {
    setSellingAsset(asset);
    setShowSellModal(true);
  };

  const confirmSell = (salePrice: number, saleDate: string) => {
    if (!sellingAsset) return;

    portfolioApi.sellAsset(sellingAsset.id, {
      sale_price: salePrice,
      sale_date: saleDate
    })
      .then(() => {
        setAssets(prev =>
          prev.map(a =>
            a.id === sellingAsset.id
              ? { ...a, salePrice, saleDate }
              : a
          )
        );
      })
      .catch(err => console.error('Ошибка при продаже:', err));
  };


  // Получение рекомендаций один раз после загрузки assets
  useEffect(() => {
    if (recFetched.current || assets.length === 0) return;
    recFetched.current = true;
    const tickers = assets.map(a => `RUS-${a.ticker}`);
    fetch('http://localhost:5000/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers })
    })
      .then(r => r.json())
      .then(data => setRecommendations(data));
  }, [assets]);

  // Финансовые метрики
  const activeAssets = assets.filter(a => !a.saleDate);   // непроданные
  const soldAssets = assets.filter(a => a.saleDate);      // проданные

  // Стоимость портфеля — только непроданные активы
  const totalValue = activeAssets.reduce((sum, a) => sum + a.currentPrice * a.quantity, 0);

  // Доход (дивиденды) — только по непроданным
  const totalIncome = activeAssets.reduce((sum, a) => sum + (a.income ?? 0), 0);

  // Суммарные вложения — по всем активам
  const totalCost = assets.reduce((sum, a) => sum + a.purchasePrice * a.quantity, 0);

  // Прибыль по непроданным — рыночная + дивиденды
  const activeProfit = activeAssets.reduce((sum, a) =>
    sum + (a.currentPrice - a.purchasePrice) * a.quantity + (a.income ?? 0), 0
  );

  // Прибыль по проданным — фиксированная (продажа - покупка) * кол-во
  const soldProfit = soldAssets.reduce((sum, a) =>
    sum + ((a.salePrice ?? 0) - a.purchasePrice) * a.quantity, 0
  );

  // Общая прибыль
  const totalProfit = activeProfit + soldProfit;

  // Доходность
  const totalReturn = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;



  // Обработчики добавления/редактирования/удаления
  const handleAdd = () => {
    setEditingAsset(null);
    setShowAssetModal(true);
  };

  const handleAddEdit = (apiAsset: ApiAsset) => {
    const mapped: Asset = {
      id: apiAsset.id,
      ticker: apiAsset.ticker,
      name: apiAsset.name,
      type: apiAsset.type,
      purchasePrice: apiAsset.purchase_price,
      currentPrice: apiAsset.current_price ?? apiAsset.purchase_price,
      quantity: apiAsset.quantity,
      purchaseDate: apiAsset.purchase_date,
    };
    setAssets(prev => editingAsset
      ? prev.map(a => a.id === mapped.id ? mapped : a)
      : [...prev, mapped]
    );
    setEditingAsset(null);
    setShowAssetModal(false);
  };

  const handleDelete = (id: string) => {
    portfolioApi.deleteAsset(id).then(() => {
      setAssets(prev => prev.filter(a => a.id !== id));
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="text-gray-600">Добро пожаловать, {user?.name || 'Инвестор'}!</p>
        </div>
        <button
          onClick={() => setShowProfileModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Редактировать профиль
        </button>
      </div>

      <StatsCards
        totalValue={totalValue}
        profitLoss={totalProfit}
        returnPercent={totalReturn}
      />

      <AssetCharts assets={assets} />

      <AssetsTable
        assets={assets}
        recommendations={recommendations}
        onAdd={handleAdd}
        onEdit={asset => { setEditingAsset(asset); setShowAssetModal(true); }}
        onDelete={handleDelete}
        onSell={handleSell}
      />

      <AssetModal
        visible={showAssetModal}
        initialData={editingAsset || undefined}
        onCancel={() => { setEditingAsset(null); setShowAssetModal(false); }}
        onSubmit={handleAddEdit}
      />

      <ProfileModal
        visible={showProfileModal}
        name={user?.name || ''}
        email={user?.email || ''}
        onCancel={() => setShowProfileModal(false)}
        onSubmit={(n, e) => { updateUserProfile(n, e); setShowProfileModal(false); }}
      />

      <SellModal
        asset={sellingAsset}
        open={showSellModal}
        onClose={() => setShowSellModal(false)}
        onConfirm={confirmSell}
      />
    </div>
  );
};

export default DashboardPage;
