import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import WhatIsDMB from './pages/WhatIsDMB';
import HowToCompare from './pages/HowToCompare';
import FoodSearchPage from './pages/FoodSearchPage';
import CatProtein from './pages/CatProtein';
import LowFatDog from './pages/LowFatDog';
import KidneyDiet from './pages/KidneyDiet';
import PuppyNutrition from './pages/PuppyNutrition';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/what-is-dmb" element={<WhatIsDMB />} />
              <Route path="/how-to-compare" element={<HowToCompare />} />
              <Route path="/food-search" element={<FoodSearchPage />} />
              <Route path="/cat-protein" element={<CatProtein />} />
              <Route path="/low-fat-dog" element={<LowFatDog />} />
              <Route path="/kidney-diet" element={<KidneyDiet />} />
              <Route path="/puppy-nutrition" element={<PuppyNutrition />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}
