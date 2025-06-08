import React, { useState, useEffect } from 'react';
import { Asset } from '../types';

interface SellModalProps {
    asset: Asset | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (salePrice: number, saleDate: string) => void;
}

const SellModal: React.FC<SellModalProps> = ({ asset, open, onClose, onConfirm }) => {
    const [salePrice, setSalePrice] = useState('');
    const [saleDate, setSaleDate] = useState('');

    useEffect(() => {
        if (asset) {
            setSalePrice(String(asset.currentPrice ?? ''));
            setSaleDate(new Date().toISOString().slice(0, 10));
        }
    }, [asset]);

    const handleConfirm = () => {
        const price = parseFloat(salePrice.replace(',', '.'));
        if (!price || !saleDate) return;
        onConfirm(price, saleDate);
        onClose();
    };

    if (!open || !asset) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h2 className="text-2xl font-bold mb-4">
                    Продажа актива {asset.ticker}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="salePrice" className="block text-sm font-medium">
                            Цена продажи (₽)
                        </label>
                        <input
                            id="salePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={salePrice}
                            onChange={e => setSalePrice(e.target.value)}
                            className="mt-1 w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="saleDate" className="block text-sm font-medium">
                            Дата продажи
                        </label>
                        <input
                            id="saleDate"
                            type="date"
                            value={saleDate}
                            onChange={e => setSaleDate(e.target.value)}
                            className="mt-1 w-full border rounded p-2"
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white border rounded hover:bg-gray-100"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Подтвердить продажу
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellModal;
