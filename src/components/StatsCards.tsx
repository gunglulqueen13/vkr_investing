import React from 'react';

interface StatsCardsProps {
  totalValue: number;
  profitLoss: number;
  returnPercent: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ totalValue, profitLoss, returnPercent }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Общая стоимость</h2>
      <p className="text-3xl font-bold text-blue-600">{totalValue.toLocaleString('ru-RU')} ₽</p>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Прибыль/Убыток</h2>
      <p className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}> {profitLoss.toLocaleString('ru-RU')} ₽ </p>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Доходность</h2>
      <p className={`text-3xl font-bold ${returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}> {returnPercent.toFixed(2)}% </p>
    </div>
  </div>
);

export default StatsCards;