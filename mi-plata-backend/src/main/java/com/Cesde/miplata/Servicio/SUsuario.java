package com.Cesde.miplata.Servicio;

import com.Cesde.miplata.Dto.MovimientosUsuarioDTO;
import com.Cesde.miplata.Mapper.IMovimientosUsuarioMapper;
import com.Cesde.miplata.Modelo.MUsuario;
import com.Cesde.miplata.Repositorio.ICuenta;
import com.Cesde.miplata.Repositorio.IMovimientosUsuarioProjection;
import com.Cesde.miplata.Repositorio.IUsuario;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SUsuario implements IMovimientosUsuarioService {

    private final IUsuario iUsuario;
    private final ICuenta iCuenta;
    private final IMovimientosUsuarioMapper iMovimientosUsuarioMapper;

    // Constructor
    public SUsuario(IUsuario iUsuario, ICuenta iCuenta, IMovimientosUsuarioMapper iMovimientosUsuarioMapper) {
        this.iUsuario = iUsuario;
        this.iCuenta = iCuenta;
        this.iMovimientosUsuarioMapper = iMovimientosUsuarioMapper;
    }

    // Adicionar un usuario
    public MUsuario adicionarUsuario(MUsuario mUsuario) throws Exception{
        try{
            if (this.iUsuario.findByEmail(mUsuario.getEmail()).isPresent())
                throw new Exception("Ya existe un usuario con ese email");
            mUsuario.setUsuarioID(null); // el ID lo genera la base de datos
            if (mUsuario.getIntentosFallidos() == null)
                mUsuario.setIntentosFallidos((byte) 0);
            if (mUsuario.getCuentaBloqueada() == null)
                mUsuario.setCuentaBloqueada(false);
            return this.iUsuario.save(mUsuario);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general
    public List<MUsuario> consultaGeneral() throws Exception{
        try{
            return this.iUsuario.findAll();
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por llave primaria
    public MUsuario consultaIndividualID(Integer usuarioID) throws Exception{
        try{
            Optional<MUsuario> usuarioEncontrado=this.iUsuario.findById(usuarioID);
            if (usuarioEncontrado.isPresent())
                return usuarioEncontrado.get();
            else
                throw new Exception("Usuario no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de usuario por email
    public MUsuario consultaPorEmail(String email) throws Exception{
        try{
            Optional<MUsuario> usuarioEncontrado=this.iUsuario.findByEmail(email);
            if (usuarioEncontrado.isPresent())
                return usuarioEncontrado.get();
            else
                throw new Exception("No existe un usuario con ese email");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de usuarios por rol
    public List<MUsuario> consultaPorRol(String rol) throws Exception{
        try{
            return this.iUsuario.findByRol(rol);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta de usuarios por nombre
    public List<MUsuario> consultaPorNombre(String nombre) throws Exception{
        try{
            return this.iUsuario.findByNombreContainingIgnoreCase(nombre);
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Modificar un registro de usuario
    public MUsuario modificarUsuario(MUsuario mUsuario,Integer usuarioID) throws Exception{
        try{
            Optional<MUsuario> usuarioEncontrado=this.iUsuario.findById(usuarioID);
            if (usuarioEncontrado.isPresent()){
                Optional<MUsuario> otroConEmail=this.iUsuario.findByEmail(mUsuario.getEmail());
                if (otroConEmail.isPresent() && !otroConEmail.get().getUsuarioID().equals(usuarioID))
                    throw new Exception("Ya existe otro usuario con ese email");
                MUsuario usuarioNuevo=usuarioEncontrado.get();
                usuarioNuevo.setNombre(mUsuario.getNombre());
                usuarioNuevo.setEmail(mUsuario.getEmail());
                usuarioNuevo.setClave(mUsuario.getClave());
                usuarioNuevo.setIntentosFallidos(mUsuario.getIntentosFallidos());
                usuarioNuevo.setCuentaBloqueada(mUsuario.getCuentaBloqueada());
                usuarioNuevo.setRol(mUsuario.getRol());

                return this.iUsuario.save(usuarioNuevo);
            }else
                throw new Exception("No se puede modificar porque usuario no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar un registro de usuario
    public Boolean eliminarUsuario(Integer usuarioID) throws Exception{
        try{
            if (this.iUsuario.existsById(usuarioID)){
                if (this.iCuenta.findByUsuarioID(usuarioID).isEmpty()){
                    this.iUsuario.deleteById(usuarioID);
                    return true;
                }else
                    throw new Exception("No se puede eliminar porque tiene cuentas relacionadas");
            }else
                throw new Exception("Usuario no registrado");
        }catch (Exception error){
            throw new Exception(error.getMessage());
        }
    }

    // Consulta completa de los movimientos de un usuario (Projection + Mapper -> DTO record)
    @Override
    public List<MovimientosUsuarioDTO> obtenerMovimientosUsuarioDTO(Integer usuarioID) {
        List<IMovimientosUsuarioProjection> proyeccion=iUsuario.consultaGeneralMovimientos(usuarioID);
        return iMovimientosUsuarioMapper.toDTOList(proyeccion);
    }
}
