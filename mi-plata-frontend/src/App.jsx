import { Routes, Route, Navigate } from "react-router-dom";
import { BankProvider } from "./modules/employees/states/BankProvider.jsx";
import { AuthProvider } from "./modules/auth/states/AuthProvider.jsx";
import ProtectedRoute from "./modules/auth/components/ProtectedRoute.jsx";
import ClienteRoute from "./modules/auth/components/ClienteRoute.jsx";
import AdminRoute from "./modules/auth/components/AdminRoute.jsx";
import AppLayout from "./modules/core/components/AppLayout.jsx";
import Landing from "./modules/core/components/Landing.jsx";
import Login from "./modules/auth/components/Login.jsx";
import Registro from "./modules/auth/components/Registro.jsx";
import Dashboard from "./modules/employees/components/Dashboard.jsx";
import Perfil from "./modules/employees/components/Perfil.jsx";
import Admin from "./modules/employees/components/Admin.jsx";
import MovimientosLayout from "./modules/payment/components/MovimientosLayout.jsx";
import MovimientosMenu from "./modules/payment/components/MovimientosMenu.jsx";
import Consignar from "./modules/payment/components/Consignar.jsx";
import Retirar from "./modules/payment/components/Retirar.jsx";
import Transferir from "./modules/payment/components/Transferir.jsx";
import Historial from "./modules/payment/components/Historial.jsx";
import Comprar from "./modules/payment/components/Comprar.jsx";
import Reportes from "./modules/reports/components/Reportes.jsx";
import Pagar from "./modules/payment/components/Pagar.jsx";
import Metas from "./modules/payment/components/Metas.jsx";
import Bolsillos from "./modules/payment/components/Bolsillos.jsx";
import ErrorLimite from "./modules/core/components/ErrorLimite.jsx";

export default function App() {
  return (
    <BankProvider>
      <AuthProvider>
        <ErrorLimite>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<ClienteRoute><Dashboard /></ClienteRoute>} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/reportes" element={<Reportes />} />

            <Route path="/movimientos" element={<ClienteRoute><MovimientosLayout /></ClienteRoute>}>
              <Route index element={<MovimientosMenu />} />
              <Route path="consignar" element={<Consignar />} />
              <Route path="retirar" element={<Retirar />} />
              <Route path="transferir" element={<Transferir />} />
              <Route path="historial" element={<Historial />} />
              <Route path="comprar" element={<Comprar />} />
              <Route path="pagar" element={<Pagar />} />
              <Route path="metas" element={<Metas />} />
              <Route path="bolsillos" element={<Bolsillos />} />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorLimite>
      </AuthProvider>
    </BankProvider>
  );
}
