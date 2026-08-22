import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CompanyProvider>
        <AppRoutes />
      </CompanyProvider>
    </BrowserRouter>
  );
};

export default App;
