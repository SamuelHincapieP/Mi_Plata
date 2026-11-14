"""
Módulo de reportes de Mi Plata (Python + Pandas + Matplotlib).
Sigue el procedimiento del ejemplo de clase: DataFrame -> cálculos -> tabla HTML.
Aquí los gráficos se devuelven como imagen en base64 para mostrarlos en la página.
"""
import base64
import io

import matplotlib
matplotlib.use("Agg")  # Dibuja sin abrir ventanas (necesario en un servidor).
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.ticker import MaxNLocator

# Colores iguales a los de la página (tokens.css).
FONDO, TEXTO, DORADO, VERDE, ROJO = "#12211C", "#F3EFE6", "#C9A45C", "#6FCF97", "#E5646A"
REJILLA = "#3a5248"
PALETA = [DORADO, VERDE, "#5FA8D3", ROJO, "#B48EAD", "#E8B04A"]

# Tamaños: se generan grandes y la página los muestra a su ancho real (legibles).
DPI = 150
TAM_TITULO = 17
TAM_ETIQUETAS = 13
TAM_TEXTO = 12

NOMBRES_TIPO = {
    "CONSIGNACION": "Consignar", "RETIRO": "Retirar", "TRANSFERENCIA_OUT": "Transferir", "TRANSFERENCIA_IN": "Transferencia recibida",
    "COMPRA_TC": "Compra con tarjeta", "PAGO_TC": "Pago de tarjeta", "CUOTA_MANEJO": "Cuota de manejo",
}


def dinero(x):
    return f"${x:,.0f} COP"


def a_base64(fig):
    """Convierte la figura de Matplotlib en texto base64 para incrustarla en HTML."""
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", dpi=DPI, facecolor=FONDO, bbox_inches="tight")
    plt.close(fig)
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def nueva_figura(titulo, ancho=10.0, alto=5.6, rejilla=True):
    fig, ax = plt.subplots(figsize=(ancho, alto))
    fig.patch.set_facecolor(FONDO)
    ax.set_facecolor(FONDO)
    ax.set_title(titulo, color=TEXTO, fontsize=TAM_TITULO, fontweight="bold", pad=18)
    ax.tick_params(colors=TEXTO, labelsize=TAM_ETIQUETAS)
    for borde in ax.spines.values():
        borde.set_color(REJILLA)
    if rejilla:
        ax.grid(axis="y", color=REJILLA, linewidth=0.7, alpha=0.7)
        ax.set_axisbelow(True)
    return fig, ax


def etiquetas_ejes(ax, xlabel=None, ylabel=None):
    if xlabel:
        ax.set_xlabel(xlabel, color=TEXTO, fontsize=TAM_TEXTO + 1)
    if ylabel:
        ax.set_ylabel(ylabel, color=TEXTO, fontsize=TAM_TEXTO + 1)


def tabla_html(df):
    """Convierte un DataFrame en tabla HTML (igual que en el ejemplo de clase)."""
    return df.to_html(index=False, classes="tabla-reporte", border=0, escape=True)


def grafico_barras(serie, titulo, xlabel, ylabel):
    fig, ax = nueva_figura(titulo, 9, 5.6)
    barras = ax.bar(serie.index, serie.values, color=DORADO, width=0.6)
    ax.bar_label(barras, color=TEXTO, fontsize=TAM_TEXTO, fontweight="bold")
    etiquetas_ejes(ax, xlabel, ylabel)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    plt.setp(ax.get_xticklabels(), rotation=20, ha="right")
    return a_base64(fig)


def grafico_circular(serie, titulo):
    """Dona con leyenda a la derecha: así las etiquetas no se encimen."""
    fig, ax = nueva_figura(titulo, 9, 5.6, rejilla=False)
    cuñas, _textos, porcentajes = ax.pie(
        serie.values, colors=PALETA[: len(serie)], autopct="%1.0f%%", pctdistance=0.78,
        startangle=90, wedgeprops={"edgecolor": FONDO, "linewidth": 2, "width": 0.42},
        textprops={"color": FONDO, "fontsize": TAM_TEXTO, "fontweight": "bold"},
    )
    leyenda = ax.legend(cuñas, serie.index, loc="center left", bbox_to_anchor=(1.0, 0.5),
                        frameon=False, labelcolor=TEXTO, fontsize=TAM_TEXTO + 1)
    ax.set_aspect("equal")
    return a_base64(fig)


def grafico_lineas(serie, titulo, ylabel):
    """Serie por fecha: pocas marcas de fecha legibles, sin amontonar etiquetas."""
    fechas = pd.to_datetime(serie.index)
    fig, ax = nueva_figura(titulo, 12, 5.8)
    ax.plot(fechas, serie.values, color=DORADO, marker="o", markersize=8, linewidth=2.6)
    ax.fill_between(fechas, serie.values, color=DORADO, alpha=0.12)
    if len(serie) <= 12:  # valor encima de cada punto solo si caben sin encimarse
        for x, y in zip(fechas, serie.values):
            ax.annotate(f"{int(y)}", (x, y), textcoords="offset points", xytext=(0, 12),
                        ha="center", color=TEXTO, fontsize=TAM_TEXTO, fontweight="bold")
    localizador = mdates.AutoDateLocator(minticks=4, maxticks=8)
    ax.xaxis.set_major_locator(localizador)
    ax.xaxis.set_major_formatter(mdates.ConciseDateFormatter(localizador))
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    ax.margins(x=0.04)
    ax.set_ylim(0, max(serie.values) * 1.25)  # el eje Y empieza en 0
    etiquetas_ejes(ax, "Fecha", ylabel)
    return a_base64(fig)


def preparar(movimientos):
    """Organiza los movimientos recibidos de la página en un DataFrame."""
    df = pd.DataFrame(movimientos)
    if df.empty:
        return df
    df["fecha"] = pd.to_datetime(df["fecha"], utc=True).dt.tz_convert("America/Bogota")
    df["Operación"] = df["tipo"].map(NOMBRES_TIPO).fillna(df["tipo"])
    return df


def tabla_auditoria(df):
    """Trazabilidad: quién hizo cada transacción y en qué cuenta."""
    t = df.sort_values("fecha", ascending=False).copy()
    t["Fecha"] = t["fecha"].dt.strftime("%Y-%m-%d %H:%M")
    t["Monto"] = t["monto"].map(dinero)
    t = t.rename(columns={"nombre": "Realizado por", "cuenta": "N.º de cuenta",
                          "tipoCuenta": "Tipo de cuenta", "nombreCuenta": "Nombre de cuenta"})
    return tabla_html(t[["Fecha", "Realizado por", "N.º de cuenta", "Tipo de cuenta",
                         "Nombre de cuenta", "Operación", "Monto"]])


def graficos_por_dia(df, titulo, ylabel):
    por_dia = df.groupby(df["fecha"].dt.strftime("%Y-%m-%d")).size()
    return por_dia if len(por_dia) > 1 else None


def reporte_admin(movimientos, total_usuarios):
    df = preparar(movimientos)
    kpis = [{"etiqueta": "Usuarios (clientes)", "valor": str(total_usuarios)},
            {"etiqueta": "Transacciones totales", "valor": str(len(df))}]
    if df.empty:
        return {"titulo": "Reporte general del banco", "kpis": kpis, "tablas": [], "graficos": [],
                "conclusion": "Todavía no hay transacciones registradas."}

    por_tipo = df.groupby("Operación").size().sort_values(ascending=False)  # cantidad por tipo
    mayor, menor = por_tipo.idxmax(), por_tipo.idxmin()
    kpis.append({"etiqueta": "Operación más usada", "valor": mayor, "detalle": f"{por_tipo[mayor]} veces"})
    kpis.append({"etiqueta": "Operación menos usada", "valor": menor, "detalle": f"{por_tipo[menor]} veces"})

    resumen = por_tipo.reset_index(name="Cantidad").rename(columns={"Operación": "Tipo de transacción"})
    por_dia = graficos_por_dia(df, "Transacciones por día", "Cantidad")

    graficos = [
        {"titulo": "Transacciones por tipo",
         "imagen": grafico_barras(por_tipo, "Transacciones por tipo", "Tipo", "Cantidad"), "ancha": False},
        {"titulo": "Proporción de operaciones",
         "imagen": grafico_circular(por_tipo, "Proporción de operaciones"), "ancha": False},
    ]
    if por_dia is not None:
        graficos.append({"titulo": "Transacciones por día",
                         "imagen": grafico_lineas(por_dia, "Transacciones por día", "Cantidad"), "ancha": True})

    return {
        "titulo": "Reporte general del banco",
        "kpis": kpis,
        "tablas": [{"titulo": "Cantidad de transacciones por tipo", "html": tabla_html(resumen)},
                   {"titulo": "Trazabilidad: quién hizo cada transacción", "html": tabla_auditoria(df)}],
        "graficos": graficos,
        "conclusion": f"El banco tiene {total_usuarios} clientes y {len(df)} transacciones. "
                      f"La operación más usada es «{mayor}» y la menos usada es «{menor}».",
    }


def reporte_usuario(movimientos, nombre):
    df = preparar(movimientos)
    if df.empty:
        return {"titulo": f"Mis reportes — {nombre}", "kpis": [], "tablas": [], "graficos": [],
                "conclusion": "Aún no has realizado transacciones."}

    nombre = df["nombre"].iloc[0]  # nombre real del cliente
    # Cuántas transacciones de cada tipo hizo con cada cuenta.
    cruce = pd.crosstab(df["cuenta"], df["Operación"])
    cruce["Total"] = cruce.sum(axis=1)
    por_cuenta = df.groupby("cuenta").size().sort_values(ascending=False)
    cuenta_top = por_cuenta.idxmax()
    por_tipo = df.groupby("Operación").size().sort_values(ascending=False)

    kpis = [{"etiqueta": "Mis transacciones", "valor": str(len(df))},
            {"etiqueta": "Cuenta más usada", "valor": cuenta_top, "detalle": f"{por_cuenta[cuenta_top]} movimientos"},
            {"etiqueta": "Operación más frecuente", "valor": por_tipo.idxmax(), "detalle": f"{por_tipo.max()} veces"}]

    # Barras agrupadas: cuentas x tipo de operación.
    fig, ax = nueva_figura("Operaciones por cuenta", 11, 5.8)
    cruce.drop(columns="Total").plot(kind="bar", ax=ax, color=PALETA, width=0.8)
    etiquetas_ejes(ax, "Cuenta", "Cantidad")
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    leyenda = ax.legend(facecolor=FONDO, labelcolor=TEXTO, fontsize=TAM_TEXTO, edgecolor=REJILLA,
                        loc="upper left", bbox_to_anchor=(1.01, 1))
    plt.setp(ax.get_xticklabels(), rotation=0)
    graf_cuentas = a_base64(fig)

    graficos = [{"titulo": "Operaciones por cuenta", "imagen": graf_cuentas, "ancha": True},
                {"titulo": "Mis operaciones", "imagen": grafico_circular(por_tipo, "Mis operaciones"), "ancha": False}]
    por_dia = graficos_por_dia(df, "Actividad por día", "Transacciones")
    if por_dia is not None:
        graficos.append({"titulo": "Actividad por día",
                         "imagen": grafico_lineas(por_dia, "Actividad por día", "Transacciones"), "ancha": True})

    return {
        "titulo": f"Mis reportes — {nombre}",
        "kpis": kpis,
        "tablas": [{"titulo": "Transacciones por cuenta y tipo",
                    "html": tabla_html(cruce.reset_index().rename(columns={"cuenta": "N.º de cuenta"}))},
                   {"titulo": "Detalle de mis transacciones", "html": tabla_auditoria(df)}],
        "graficos": graficos,
        "conclusion": f"Has hecho {len(df)} transacciones; tu cuenta más usada es {cuenta_top}.",
    }
