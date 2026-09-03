import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
