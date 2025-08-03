import './App.css';
import Home from './Home';
import Visualization from './Visualization';

import { StockProvider } from './contexts/StockContext';

function App() {
  return (
    <StockProvider>
      <div className="app">
        <h1>retrotrader</h1>
        <Home />
        <Visualization />
      </div>
    </StockProvider>
  );
}

export default App;
