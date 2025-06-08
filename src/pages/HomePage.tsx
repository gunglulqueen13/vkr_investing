import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Shield, Zap, HelpCircle, Users } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Управляйте своими инвестициями эффективно</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Анализируйте свой инвестиционный портфель, получайте персональные рекомендации и принимайте обоснованные решения.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/auth" 
              className="bg-white text-blue-700 hover:bg-blue-100 px-8 py-3 rounded-md font-bold text-lg"
            >
              Начать бесплатно
            </Link>
            <Link 
              to="/guide" 
              className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 rounded-md font-bold text-lg"
            >
              Узнать больше
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Возможности платформы</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <BarChart3 size={28} className="text-blue-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">Анализ портфеля</h3>
              <p className="text-gray-600">
                Получайте детальную аналитику вашего инвестиционного портфеля, включая распределение активов, доходность и риски.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <TrendingUp size={28} className="text-blue-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">Расчет доходности</h3>
              <p className="text-gray-600">
                Автоматический расчет доходности облигаций (YTM) и других активов для принятия взвешенных инвестиционных решений.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Shield size={28} className="text-blue-700" />
              </div>
              <h3 className="text-xl font-bold mb-2">Персональные рекомендации</h3>
              <p className="text-gray-600">
                Получайте индивидуальные рекомендации по покупке, продаже или удержанию активов на основе актуальных рыночных данных.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Как начать работу</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Регистрация</h3>
              <p className="text-gray-600">
                Создайте аккаунт, используя email и пароль
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Добавление активов</h3>
              <p className="text-gray-600">
                Добавьте ваши инвестиционные активы в портфель
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Анализ портфеля</h3>
              <p className="text-gray-600">
                Изучите аналитику и рекомендации по вашему портфелю
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Принятие решений</h3>
              <p className="text-gray-600">
                Используйте рекомендации для оптимизации инвестиций
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Готовы начать управлять своими инвестициями?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам инвесторов, которые уже оптимизировали свои портфели с помощью нашей платформы.
          </p>
          <Link 
            to="/auth" 
            className="bg-white text-blue-700 hover:bg-blue-100 px-8 py-3 rounded-md font-bold text-lg inline-block"
          >
            Создать аккаунт
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Часто задаваемые вопросы</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <HelpCircle size={20} className="text-blue-700 mr-2" />
                <h3 className="text-xl font-bold">Как рассчитывается доходность облигаций?</h3>
              </div>
              <p className="text-gray-600">
                Доходность к погашению (YTM) рассчитывается по формуле: YTM = ((N + C - P) / P) × (365 / d) × 100%, где N - номинал, C - купон, P - цена, d - дней до погашения.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <HelpCircle size={20} className="text-blue-700 mr-2" />
                <h3 className="text-xl font-bold">Как формируются рекомендации по активам?</h3>
              </div>
              <p className="text-gray-600">
                Рекомендации формируются на основе актуальных рыночных данных, исторической доходности, технического анализа и других факторов. Система анализирует множество параметров для выдачи оптимальных рекомендаций.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <HelpCircle size={20} className="text-blue-700 mr-2" />
                <h3 className="text-xl font-bold">Можно ли добавлять активы с других бирж?</h3>
              </div>
              <p className="text-gray-600">
                В настоящее время платформа поддерживает активы с Московской биржи. Поддержка других бирж планируется в будущих обновлениях.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;