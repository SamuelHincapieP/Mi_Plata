package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Modelo.MCategoriaGasto;
import com.Cesde.miplata.Repositorio.ICategoriaGasto;
import org.springframework.stereotype.Service;

import java.util.List;

// Catálogo de categorías de gasto (se usa en el menú desplegable de compras con TC)
@Service
public class SCategoria {

    private final ICategoriaGasto iCategoriaGasto;

    public SCategoria(ICategoriaGasto iCategoriaGasto) {
        this.iCategoriaGasto = iCategoriaGasto;
    }

    // Consulta general del catálogo
    public List<MCategoriaGasto> consultaGeneral() throws Exception {
        try {
            return this.iCategoriaGasto.findAll();
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }
}
