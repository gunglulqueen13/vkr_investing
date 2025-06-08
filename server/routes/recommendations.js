import express from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const { tickers } = req.body;
  if (!tickers || !Array.isArray(tickers)) {
    return res.status(400).json({ error: 'Invalid tickers list' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const results = {};

    for (const ticker of tickers) {
      try {
        const symbol = ticker.includes('-') ? ticker : `RUS-${ticker}`;
        const url = `https://ru.tradingview.com/symbols/${symbol}/technicals/`;

        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForSelector('[class*="speedometerWrapper"][class*="summary"] [class*="countersWrapper"]', { timeout: 5000 });

        const recommendation = await page.evaluate(() => {
          const summary = document.querySelector('[class*="speedometerWrapper"][class*="summary"]');
          if (!summary) return null;
          const wrapper = summary.querySelector('[class*="countersWrapper"]');
          if (!wrapper) return null;
          const items = Array.from(wrapper.querySelectorAll('[class*="counterWrapper"]'));
          let sell = 0, neutral = 0, buy = 0;
          items.forEach(item => {
            const title = item.querySelector('[class*="counterTitle"]')?.textContent.trim();
            const count = parseInt(item.querySelector('[class*="counterNumber"]')?.textContent.trim(), 10) || 0;
            if (title === 'Продавать') sell = count;
            else if (title === 'Держать') neutral = count;
            else if (title === 'Покупать') buy = count;
          });
          const total = sell + neutral + buy;
          if (total === 0) return null;
          const pSell = sell / total;
          const pNeutral = neutral / total;
          const pBuy = buy / total;

          let side;
          if (pBuy > pSell && pBuy > pNeutral) side = 'buy';
          else if (pSell > pBuy && pSell > pNeutral) side = 'sell';
          else side = 'neutral';
          if (side === 'neutral') return 'Держать';

          const strongThreshold = 0.6;
          if (side === 'buy') {
            return 'Покупать';
          } else {
            return 'Продавать';
          }
        });

        results[ticker] = recommendation;
      }
      catch (error) {
        console.log(error)
      }

    }

    res.json(results);
  } catch (err) {
    next(err);
  } finally {
    if (browser) await browser.close();
  }
});

export default router;
