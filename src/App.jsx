import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'sonner'; // <--- Importante

function App() {
  return (
    <AuthProvider>
      {/* O Toaster fica aqui para poder mostrar mensagens em qualquer lugar do app */}
      <Toaster position="top-center" richColors />
      
      <Dashboard />
    </AuthProvider>
  );
}

export default App;