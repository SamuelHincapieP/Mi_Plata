import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideNav from "./SideNav.jsx";
import TopBar from "./TopBar.jsx";
import "./layout.css";

/** Estructura de las pantallas autenticadas: lateral + topbar + contenido. */
export default function AppLayout() {
  const { pathname } = useLocation();

  // Al cambiar de pantalla, el contenido vuelve arriba.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="layout">
      <SideNav />
      <div className="layout__contenido">
        <TopBar />
        <main id="contenido" className="pagina">
          <Outlet />
        </main>
      </div>
    </div>
  );
}