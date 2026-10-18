import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

const App = () => {
  return (
    // 2. El proveedor envuelve la app para cumplir el requisito de estado global[cite: 4]
    <AuthProvider>
      {/* 3. El enrutador gestiona las pantallas de la HU-2 y las vistas temporales[cite: 4] */}
      <AppRouter />
    </AuthProvider>
  );
};

export default App;