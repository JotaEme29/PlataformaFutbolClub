// src/components/GestionRoles.jsx - GESTIÓN DE ROLES Y PERMISOS PARA PLATAFORMA FÚTBOL 2.0

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';

function GestionRoles() {
  const { currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    rol: 'entrenador',
    equipoId: '',
    nombre: '',
    apellido: ''
  });

  const roles = [
    { 
      value: 'administrador_club', 
      label: 'Administrador del Club',
      description: 'Acceso completo a todas las funcionalidades del club',
      permissions: ['gestionar_equipos', 'gestionar_jugadores', 'gestionar_eventos', 'ver_estadisticas', 'gestionar_usuarios']
    },
    { 
      value: 'entrenador', 
      label: 'Entrenador Principal',
      description: 'Gestión completa de su equipo asignado',
      permissions: ['gestionar_jugadores_equipo', 'gestionar_eventos_equipo', 'ver_estadisticas_equipo']
    },
    { 
      value: 'asistente', 
      label: 'Entrenador Asistente',
      description: 'Asistencia en la gestión del equipo',
      permissions: ['ver_jugadores_equipo', 'gestionar_eventos_equipo', 'ver_estadisticas_equipo']
    },
    { 
      value: 'jugador', 
      label: 'Jugador',
      description: 'Acceso a información personal y del equipo',
      permissions: ['ver_perfil_personal', 'ver_eventos_equipo', 'ver_estadisticas_personales']
    }
  ];

  useEffect(() => {
    if (currentUser?.clubId) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios del club
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('clubId', '==', currentUser.clubId));
      const usuariosSnapshot = await getDocs(q);
      const usuariosData = usuariosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(usuariosData);

      // Cargar invitaciones pendientes
      const invitacionesRef = collection(db, 'invitaciones');
      const qInvitaciones = query(
        invitacionesRef, 
        where('clubId', '==', currentUser.clubId),
        where('estado', '==', 'pendiente')
      );
      const invitacionesSnapshot = await getDocs(qInvitaciones);
      const invitacionesData = invitacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvitaciones(invitacionesData);

      // Cargar equipos
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      const equiposSnapshot = await getDocs(equiposRef);
      const equiposData = equiposSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposData);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    
    try {
      const invitacionesRef = collection(db, 'invitaciones');
      await addDoc(invitacionesRef, {
        ...inviteData,
        clubId: currentUser.clubId,
        clubNombre: currentUser.club?.nombre,
        invitadoPor: currentUser.uid,
        fechaInvitacion: serverTimestamp(),
        estado: 'pendiente'
      });

      alert('Invitación enviada exitosamente');
      setInviteData({ email: '', rol: 'entrenador', equipoId: '', nombre: '', apellido: '' });
      setShowInviteForm(false);
      loadData();
    } catch (error) {
      console.error('Error al enviar invitación:', error);
      alert('Error al enviar la invitación');
    }
  };

  const handleUpdateUserRole = async (userId, newRole, equipoId = null) => {
    if (window.confirm('¿Estás seguro de que quieres cambiar el rol de este usuario?')) {
      try {
        const userDocRef = doc(db, 'usuarios', userId);
        const updateData = { rol: newRole };
        
        if (equipoId) {
          updateData.equipoId = equipoId;
        }
        
        await updateDoc(userDocRef, updateData);
        loadData();
        alert('Rol actualizado exitosamente');
      } catch (error) {
        console.error('Error al actualizar rol:', error);
        alert('Error al actualizar el rol');
      }
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta invitación?')) {
      try {
        const invitationDocRef = doc(db, 'invitaciones', invitationId);
        await deleteDoc(invitationDocRef);
        loadData();
      } catch (error) {
        console.error('Error al cancelar invitación:', error);
      }
    }
  };

  const getRoleInfo = (roleValue) => {
    return roles.find(role => role.value === roleValue) || { label: roleValue, description: '', permissions: [] };
  };

  const getEquipoNombre = (equipoId) => {
    const equipo = equipos.find(eq => eq.id === equipoId);
    return equipo ? equipo.nombre : 'No asignado';
  };

  if (loading) {
    return <div className="loading">Cargando gestión de roles...</div>;
  }

  return (
    <div className="gestion-roles">
      <div className="roles-header">
        <h2>Gestión de Roles y Permisos</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowInviteForm(true)}
        >
          + Invitar Usuario
        </button>
      </div>

      {/* Información de Roles */}
      <div className="roles-info-section">
        <h3>Tipos de Roles</h3>
        <div className="roles-info-grid">
          {roles.map(role => (
            <div key={role.value} className="role-info-card">
              <h4>{role.label}</h4>
              <p className="role-description">{role.description}</p>
              <div className="permissions-list">
                <strong>Permisos:</strong>
                <ul>
                  {role.permissions.map(permission => (
                    <li key={permission}>
                      {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usuarios Actuales */}
      <div className="usuarios-section">
        <h3>Usuarios del Club ({usuarios.length})</h3>
        <div className="usuarios-table">
          <div className="table-header">
            <div className="col-name">Usuario</div>
            <div className="col-role">Rol</div>
            <div className="col-team">Equipo</div>
            <div className="col-actions">Acciones</div>
          </div>
          {usuarios.map(usuario => {
            const roleInfo = getRoleInfo(usuario.rol);
            return (
              <div key={usuario.id} className="table-row">
                <div className="col-name">
                  <div className="user-info">
                    <strong>{usuario.nombre} {usuario.apellido}</strong>
                    <span className="user-email">{usuario.email}</span>
                  </div>
                </div>
                <div className="col-role">
                  <span className={`role-badge role-${usuario.rol}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <div className="col-team">
                  {usuario.equipoId ? getEquipoNombre(usuario.equipoId) : 'Todos los equipos'}
                </div>
                <div className="col-actions">
                  {usuario.id !== currentUser.uid && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const [newRole, equipoId] = e.target.value.split('|');
                          handleUpdateUserRole(usuario.id, newRole, equipoId);
                          e.target.value = '';
                        }
                      }}
                      className="role-selector"
                    >
                      <option value="">Cambiar rol...</option>
                      {roles.map(role => (
                        <optgroup key={role.value} label={role.label}>
                          {role.value === 'entrenador' || role.value === 'asistente' || role.value === 'jugador' ? (
                            equipos.map(equipo => (
                              <option key={`${role.value}-${equipo.id}`} value={`${role.value}|${equipo.id}`}>
                                {role.label} - {equipo.nombre}
                              </option>
                            ))
                          ) : (
                            <option value={`${role.value}|`}>
                              {role.label}
                            </option>
                          )}
                        </optgroup>
                      ))}
                    </select>
                  )}
                  {usuario.id === currentUser.uid && (
                    <span className="current-user-badge">Tú</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invitaciones Pendientes */}
      {invitaciones.length > 0 && (
        <div className="invitaciones-section">
          <h3>Invitaciones Pendientes ({invitaciones.length})</h3>
          <div className="invitaciones-grid">
            {invitaciones.map(invitacion => {
              const roleInfo = getRoleInfo(invitacion.rol);
              return (
                <div key={invitacion.id} className="invitacion-card">
                  <div className="invitacion-info">
                    <h4>{invitacion.nombre} {invitacion.apellido}</h4>
                    <p><strong>Email:</strong> {invitacion.email}</p>
                    <p><strong>Rol:</strong> {roleInfo.label}</p>
                    {invitacion.equipoId && (
                      <p><strong>Equipo:</strong> {getEquipoNombre(invitacion.equipoId)}</p>
                    )}
                    <p><strong>Enviada:</strong> {
                      invitacion.fechaInvitacion?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'
                    }</p>
                  </div>
                  <div className="invitacion-actions">
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => handleCancelInvitation(invitacion.id)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulario de Invitación */}
      {showInviteForm && (
        <div className="form-modal">
          <form onSubmit={handleSendInvite} className="invite-form">
            <h4>Invitar Nuevo Usuario</h4>
            <div className="input-row">
              <div className="input-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={inviteData.nombre}
                  onChange={(e) => setInviteData({...inviteData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  value={inviteData.apellido}
                  onChange={(e) => setInviteData({...inviteData, apellido: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Email *</label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label>Rol *</label>
              <select
                value={inviteData.rol}
                onChange={(e) => setInviteData({...inviteData, rol: e.target.value})}
                required
              >
                {roles.filter(role => role.value !== 'administrador_club').map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            {(inviteData.rol === 'entrenador' || inviteData.rol === 'asistente' || inviteData.rol === 'jugador') && (
              <div className="input-group">
                <label>Equipo *</label>
                <select
                  value={inviteData.equipoId}
                  onChange={(e) => setInviteData({...inviteData, equipoId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar equipo</option>
                  {equipos.map(equipo => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="role-preview">
              <h5>Permisos del rol seleccionado:</h5>
              <ul>
                {getRoleInfo(inviteData.rol).permissions.map(permission => (
                  <li key={permission}>
                    {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
              </ul>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Enviar Invitación</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowInviteForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default GestionRoles;
