import express from 'express';
import axios from 'axios';
import { parseISO, differenceInCalendarDays } from 'date-fns';
import xml2js from 'xml2js';

const router = express.Router();

const parseXml = (xml) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false, ignoreAttrs: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://iss.moex.com/iss/engines/stock/markets/bonds/securities');
    const xmlData = response.data;
    const parsedData = await parseXml(xmlData);
    const securities = parsedData.document.data.find(d => d.$.id === 'securities').rows.row;
    const marketdata = parsedData.document.data.find(d => d.$.id === 'marketdata').rows.row;
    const bondsMap = new Map();
    securities.forEach(sec => {
      const secid = sec.$.SECID;
      bondsMap.set(secid, {
        sec: sec.$,
        market: marketdata.find(m => m.$.SECID === secid)?.$ || {}
      });
    });

    const result = Array.from(bondsMap.values()).map(({ sec, market }) => {
      try {
        if (!sec.SECID || !sec.ISIN || !sec.SHORTNAME) {
          console.log(`Пропуск ${sec.SECID}: отсутствуют базовые данные`);
          return null;
        }
        const offerDate = sec.OFFERDATE || sec.MATDATE;
        if (!offerDate || offerDate === '0000-00-00') {
          console.log(`Пропуск ${sec.SECID}: невалидная дата "${offerDate}"`);
          return null;
        }
        let parsedDate;
        try {
          parsedDate = parseISO(offerDate);
          if (isNaN(parsedDate.getTime())) throw new Error();
        } catch {
          console.log(`Пропуск ${sec.SECID}: ошибка парсинга даты "${offerDate}"`);
          return null;
        }
        const daysToMaturity = differenceInCalendarDays(parsedDate, new Date()) - 1;
        if (daysToMaturity <= 0) {
          console.log(`Пропуск ${sec.SECID}: дата ${offerDate} уже прошла`);
          return null;
        }
        const lastPrice = parseFloat(market.LAST) || 0;
        if (lastPrice <= 0) {
          console.log(`Пропуск ${sec.SECID}: цена ${lastPrice} <= 0`);
          return null;
        }
        const nkd = parseFloat(sec.ACCRUEDINT) || 0;
        if (nkd > 500) {
          console.log(`Пропуск ${sec.SECID}: НКД ${nkd} > 500`);
          return null;
        }
        const couponPeriod = parseFloat(sec.COUPONPERIOD) || 1;
        if (couponPeriod <= 0) {
          console.log(`Пропуск ${sec.SECID}: период купона ${couponPeriod} дней`);
          return null;
        }
        const faceValue = parseFloat(sec.FACEVALUEONSETTLEDATE) || 1000;
        const price = (lastPrice / 100) * faceValue;
        const couponPercent = parseFloat(sec.COUPONPERCENT) || 0;
        const couponValue = parseFloat(sec.COUPONVALUE) || 0;
        const summCoupon = (daysToMaturity / couponPeriod) * couponValue + nkd;
        const couponYield = couponPercent * (faceValue / price);
        const ytm = ((faceValue + summCoupon - (price + nkd)) / (price + nkd)) * (365 / daysToMaturity) * 100;
        
        return {
          isin: sec.ISIN,
          name: sec.SHORTNAME,
          current_price: parseFloat(price.toFixed(2)),
          nkd: parseFloat(nkd.toFixed(2)),
          face_value: faceValue,
          coupon_profit: parseFloat(couponYield.toFixed(2)),
          mat_date: offerDate,
          ytm: parseFloat(ytm.toFixed(2)),
          days_to_maturity: daysToMaturity
        };

      } catch (e) {
        console.error(`Критическая ошибка обработки ${sec?.SECID}:`, e);
        return null;
      }
    }).filter(Boolean);

    console.log('Успешно обработано:', result.length);
    return res.status(201).json(result);
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;