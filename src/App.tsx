import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import EntregasPage from './pages/EntregasPage';
import { useContentProtection } from './hooks/useContentProtection';

function App() {
  useContentProtection();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/entregas" element={<EntregasPage />} />
      </Routes>
    </>
  );
}

export default App;
