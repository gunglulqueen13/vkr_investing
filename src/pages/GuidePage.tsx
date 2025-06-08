import React from 'react';
import { HelpCircle, BookOpen, Calculator, AlertTriangle, PlusCircle, BarChart3 } from 'lucide-react';

const GuidePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <BookOpen className="mr-3 text-blue-600" size={32} />
          Справочное руководство
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Calculator className="mr-2 text-blue-600" size={24} />
            Расчет доходности облигаций (YTM)
          </h2>
          
          <p className="mb-4">
            Доходность к погашению (YTM, Yield to Maturity) — это показатель, который отражает полную доходность облигации при условии, что она будет удерживаться до даты погашения.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-2">Формула расчета YTM:</h3>
            <p className="font-mono text-lg">
              YTM = ((N + C - P) / P) × (365 / d) × 100%
            </p>
            <ul className="mt-2 space-y-1">
              <li><strong>N</strong> — номинальная стоимость облигации</li>
              <li><strong>C</strong> — купонный доход</li>
              <li><strong>P</strong> — текущая цена облигации</li>
              <li><strong>d</strong> — количество дней до погашения</li>
            </ul>
          </div>
          
          <p className="mb-4">
            <strong>Пример расчета:</strong> Облигация с номиналом 1000 рублей, купонной ставкой 8% годовых, текущей ценой 950 рублей и сроком до погашения 365 дней.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="font-mono">
              YTM = ((1000 + 80 - 950) / 950) × (365 / 365) × 100% = (130 / 950) × 100% = 13.68%
            </p>
          </div>
          
          <p>
            Таким образом, доходность к погашению данной облигации составляет 13.68%.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <PlusCircle className="mr-2 text-blue-600" size={24} />
            Добавление активов в портфель
          </h2>
          
          <p className="mb-4">
            Для эффективного управления инвестициями важно правильно добавлять активы в ваш портфель.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Пошаговая инструкция:</h3>
          
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Перейдите в раздел <strong>Личный кабинет</strong>.</li>
            <li>Нажмите кнопку <strong>Добавить актив</strong> в верхней части таблицы активов.</li>
            <li>Заполните форму добавления актива:
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Тикер</strong> — уникальный идентификатор ценной бумаги на бирже</li>
                <li><strong>Название</strong> — полное название актива</li>
                <li><strong>Тип актива</strong> — выберите из списка (акция, облигация, ETF)</li>
                <li><strong>Цена покупки</strong> — цена, по которой вы приобрели актив</li>
                <li><strong>Количество</strong> — количество приобретенных единиц актива</li>
                <li><strong>Дата покупки</strong> — дата приобретения актива</li>
              </ul>
            </li>
            <li>Нажмите кнопку <strong>Добавить</strong> для сохранения информации.</li>
          </ol>
          
          <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-400">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-500 mr-2 mt-1" size={20} />
              <div>
                <h4 className="font-semibold">Важно:</h4>
                <p>Указывайте точную цену покупки и дату для корректного расчета доходности. Система автоматически обновляет текущие цены активов для расчета актуальной стоимости портфеля.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <BarChart3 className="mr-2 text-blue-600" size={24} />
            Работа со скринером облигаций
          </h2>
          
          <p className="mb-4">
            Скринер облигаций — это инструмент, который позволяет фильтровать и сортировать облигации по различным параметрам для поиска наиболее подходящих вариантов инвестирования.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Основные функции скринера:</h3>
          
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>
              <strong>Фильтрация</strong> — позволяет отбирать облигации по различным параметрам:
              <ul className="list-disc pl-6 mt-1">
                <li>Доходность к погашению (YTM)</li>
                <li>Купонная ставка</li>
                <li>Дата погашения</li>
                <li>Кредитный рейтинг</li>
              </ul>
            </li>
            <li>
              <strong>Сортировка</strong> — упорядочивает результаты по выбранному параметру (по возрастанию или убыванию)
            </li>
            <li>
              <strong>Поиск</strong> — позволяет быстро найти облигацию по тикеру, названию или эмитенту
            </li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">Рекомендации по использованию:</h3>
          
          <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Начните с установки фильтров по ключевым параметрам (например, минимальная доходность и срок погашения).</li>
            <li>Отсортируйте результаты по YTM для выявления наиболее доходных облигаций.</li>
            <li>Обратите внимание на кредитный рейтинг — более высокий рейтинг обычно означает меньший риск.</li>
            <li>Сравните купонную ставку с YTM для понимания, торгуется ли облигация с премией или дисконтом.</li>
            <li>Регулярно обновляйте данные с помощью кнопки "Обновить данные" для получения актуальной информации.</li>
          </ol>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <HelpCircle className="mr-2 text-blue-600" size={24} />
            Часто задаваемые вопросы (FAQ)
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Как интерпретировать рекомендации по активам?</h3>
              <p>
                Рекомендации формируются на основе технического и фундаментального анализа и могут быть трех типов:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong className="text-green-600">Покупать</strong> — актив недооценен и имеет потенциал роста</li>
                <li><strong className="text-yellow-600">Держать</strong> — актив оценен справедливо, рекомендуется сохранить позицию</li>
                <li><strong className="text-red-600">Продавать</strong> — актив переоценен или имеет негативные перспективы</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Как часто обновляются данные по активам?</h3>
              <p>
                Данные по текущим ценам активов обновляются автоматически при каждом входе в личный кабинет. Для облигаций в скринере вы можете обновить данные вручную, нажав кнопку "Обновить данные".
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Как рассчитывается общая доходность портфеля?</h3>
              <p>
                Общая доходность портфеля рассчитывается как процентное изменение между суммой, инвестированной в активы (цена покупки × количество), и текущей стоимостью портфеля (текущая цена × количество).
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Можно ли добавлять активы с других бирж?</h3>
              <p>
                В настоящее время платформа поддерживает только активы с Московской биржи. Поддержка международных бирж планируется в будущих обновлениях.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Как обеспечивается безопасность данных?</h3>
              <p>
                Все данные пользователей хранятся в зашифрованном виде и доступны только владельцу аккаунта. Мы не передаем информацию о ваших инвестициях третьим лицам и используем современные методы защиты данных.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;