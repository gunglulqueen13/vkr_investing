import express from 'express';
import db from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware для проверки аутентификации
router.use(authenticateToken);

// Получение всех активов пользователя
router.get('/assets', async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await db.query(
      `SELECT * FROM stocks 
       WHERE user_id = $1 
       ORDER BY id DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении активов:', err);
    res.status(500).json({ error: 'Ошибка при получении списка активов' });
  }
});

// Добавление нового актива
router.post('/assets', async (req, res) => {
  const { userId } = req.user;
  const {
    ticker,
    name,
    type,
    purchase_price,
    quantity,
    purchase_date
  } = req.body;

  // Валидация обязательного поля
  if (!purchase_date) {
    return res.status(400).json({ error: 'Дата покупки не указана.' });
  }

  // Преобразуем строку в Date
  const pd = new Date(purchase_date);
  if (isNaN(pd.getTime())) {
    return res.status(400).json({ error: 'Неверный формат даты.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO stocks (
         user_id,
         ticker,
         name,
         type,
         purchase_price,
         quantity,
         purchase_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, ticker, name, type, purchase_price, quantity, pd]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении актива:', req.body, err);
    return res.status(500).json({ error: 'Не удалось добавить актив.' });
  }
});


// Обновление актива
router.put('/assets/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const assetId = req.params.id;
    const {
      ticker,
      name,
      type,
      purchase_price,
      quantity,
      purchase_date
    } = req.body;

    // Проверяем владение
    const asset = await db.query(
      'SELECT * FROM stocks WHERE id = $1 AND user_id = $2',
      [assetId, userId]
    );
    if (asset.rows.length === 0) {
      return res.status(404).json({ error: 'Актив не найден' });
    }

    const safeDate = (val) => {
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    };

    const result = await db.query(
      `UPDATE stocks SET
    ticker = $1,
    name = $2,
    type = $3,
    purchase_price = $4,
    quantity = $5,
    purchase_date = $6
  WHERE id = $7 AND user_id = $8
  RETURNING *`,
      [
        ticker,
        name,
        type,
        purchase_price,
        quantity,
        safeDate(purchase_date),
        assetId,
        userId
      ]
    );


    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении актива:', err);
    res.status(500).json({ error: 'Ошибка при обновлении актива' });
  }
});

router.put('/assets/:id/sell', async (req, res) => {
  try {
    const { userId } = req.user;
    const assetId = req.params.id;
    const { sale_date, sale_price } = req.body;

    // проверка владения
    const asset = await db.query(
      'SELECT * FROM stocks WHERE id = $1 AND user_id = $2',
      [assetId, userId]
    );
    if (!asset.rows.length) {
      return res.status(404).json({ error: 'Актив не найден' });
    }

    const safeDate = val => {
      const d = new Date(val);
      return isNaN(d) ? null : d;
    };

    const result = await db.query(
      `UPDATE stocks
         SET sale_date  = $1,
             sale_price = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [ safeDate(sale_date), sale_price ?? null, assetId, userId ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при продаже актива:', err);
    res.status(500).json({ error: 'Ошибка при продаже' });
  }
});


// Удаление актива
router.delete('/assets/:id', async (req, res) => {
  try {
    const { userId } = req.user;
    const assetId = req.params.id;

    // Проверяем, принадлежит ли актив пользователю
    const asset = await db.query(
      'SELECT * FROM stocks WHERE id = $1 AND user_id = $2',
      [assetId, userId]
    );

    if (asset.rows.length === 0) {
      return res.status(404).json({ error: 'Актив не найден' });
    }

    await db.query(
      'DELETE FROM stocks WHERE id = $1 AND user_id = $2',
      [assetId, userId]
    );

    res.json({ message: 'Актив успешно удален' });
  } catch (err) {
    console.error('Ошибка при удалении актива:', err);
    res.status(500).json({ error: 'Ошибка при удалении актива' });
  }
});

// Получение статистики портфеля
router.get('/statistics', async (req, res) => {
  try {
    const { userId } = req.user;

    // Получаем все активы пользователя
    const assets = await db.query(
      `SELECT * FROM stocks WHERE user_id = $1`,
      [userId]
    );

    // Рассчитываем статистику
    const statistics = {
      totalValue: 0,
      totalProfit: 0,
      assetDistribution: {
        stocks: 0,
        bonds: 0,
        etf: 0
      }
    };

    assets.rows.forEach(asset => {
      const currentValue = asset.current_price * asset.quantity;
      const purchaseValue = asset.purchase_price * asset.quantity;

      statistics.totalValue += currentValue;
      statistics.totalProfit += (currentValue - purchaseValue);

      switch (asset.type) {
        case 'stock':
          statistics.assetDistribution.stocks += currentValue;
          break;
        case 'bond':
          statistics.assetDistribution.bonds += currentValue;
          break;
        case 'etf':
          statistics.assetDistribution.etf += currentValue;
          break;
      }
    });

    res.json(statistics);
  } catch (err) {
    console.error('Ошибка при получении статистики:', err);
    res.status(500).json({ error: 'Ошибка при получении статистики портфеля' });
  }
});

export default router;