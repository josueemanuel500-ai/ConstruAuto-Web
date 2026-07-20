import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ServiciosPage from './pages/ServiciosPage';
import EntregasPage from './pages/EntregasPage';
import NosotrosPage from './pages/NosotrosPage';
import CatalogoPage from './pages/CatalogoPage';
import CalculadoraPage from './pages/CalculadoraPage';
import JuegoPage from './pages/JuegoPage';
import ContactoPage from './pages/ContactoPage';
import { useContentProtection } from './hooks/useContentProtection';

function App() {
  useContentProtection();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/entregas" element={<EntregasPage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/calculadora" element={<CalculadoraPage />} />
          <Route path="/juego" element={<JuegoPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
