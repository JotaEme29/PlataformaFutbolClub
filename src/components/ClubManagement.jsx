// src/components/ClubManagement.jsx - GESTIÓN DE CLUBES PARA PLATAFORMA FÚTBOL 2.0

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
  where
} from 'firebase/firestore';

function ClubManagement() {
  const { currentUser, getEquiposClub } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTeam, setNewTeam] = useState({
    nombre: '',
    categoria: '',
    formato: 11,
    entrenador: '',
    asistente: ''
  });
  const [newCategory, setNewCategory] = useState({
    nombre: '',
    edadMinima: '',
    edadMaxima: '',
    descripcion: ''
  });
  const [editingCategory, setEditingCategory] = useState(null); // Estado para la categoría en edición
  const [editCategoryForm, setEditCategoryForm] = useState({
    nombre: '',
    edadMinima: '',
    edadMaxima: '',
    descripcion: ''
  });
  const [editingTeam, setEditingTeam] = useState(null); // Estado para el equipo en edición
  const [editTeamForm, setEditTeamForm] = useState({
    nombre: '',
    categoria: '',
    formato: 11,
    entrenador: '',
    asistente: ''
  });

  const formatosJuego = [
    { value: 5, label: 'Fútbol 5' },
    { value: 7, label: 'Fútbol 7' },
    { value: 8, label: 'Fútbol 8' },
    { value: 9, label: 'Fútbol 9' },
    { value: 11, label: 'Fútbol 11' }
  ];

  useEffect(() => {
    if (currentUser?.clubId) {
      loadClubData();
    }
  }, [currentUser]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías
      const categoriasRef = collection(db, 'clubes', currentUser.clubId, 'categorias');
      const categoriasSnapshot = await getDocs(categoriasRef);
      const categoriasData = categoriasSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(cat => !cat.placeholder); // Filtrar el placeholder
      setCategorias(categoriasData);

      // Cargar equipos
      const equiposData = await getEquiposClub(currentUser.clubId);
      setEquipos(equiposData);
      
    } catch (error) {
      console.error('Error al cargar datos del club:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    try {
      const categoriasRef = collection(db, 'clubes', currentUser.clubId, 'categorias');
      await addDoc(categoriasRef, {
        ...newCategory,
        edadMinima: parseInt(newCategory.edadMinima),
        edadMaxima: parseInt(newCategory.edadMaxima),
        fechaCreacion: serverTimestamp(),
        activa: true
      });

      setNewCategory({ nombre: '', edadMinima: '', edadMaxima: '', descripcion: '' });
      setShowNewCategoryForm(false);
      loadClubData();
    } catch (error) {
      console.error('Error al crear categoría:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.id);
    setEditCategoryForm({
      nombre: category.nombre,
      edadMinima: category.edadMinima,
      edadMaxima: category.edadMaxima,
      descripcion: category.descripcion
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const categoryDocRef = doc(db, 'clubes', currentUser.clubId, 'categorias', editingCategory);
      await updateDoc(categoryDocRef, {
        ...editCategoryForm,
        edadMinima: parseInt(editCategoryForm.edadMinima),
        edadMaxima: parseInt(editCategoryForm.edadMaxima),
      });
      setEditingCategory(null);
      loadClubData();
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.')) {
      try {
        // Verificar si hay equipos asociados a esta categoría
        const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
        const q = query(equiposRef, where('categoria', '==', categoryId));
        const equiposSnapshot = await getDocs(q);

        if (!equiposSnapshot.empty) {
          alert('No se puede eliminar la categoría porque tiene equipos asociados. Primero elimina o reasigna los equipos.');
          return;
        }

        const categoryDocRef = doc(db, 'clubes', currentUser.clubId, 'categorias', categoryId);
        await deleteDoc(categoryDocRef);
        loadClubData();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
      }
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    if (equipos.length >= 12) {
      alert('Has alcanzado el límite máximo de 12 equipos por club');
      return;
    }

    try {
      const equiposRef = collection(db, 'clubes', currentUser.clubId, 'equipos');
      await addDoc(equiposRef, {
        ...newTeam,
        formato: parseInt(newTeam.formato),
        fechaCreacion: serverTimestamp(),
        activo: true,
        jugadores: [],
        estadisticas: {
          partidosJugados: 0,
          partidosGanados: 0,
          partidosEmpatados: 0,
          partidosPerdidos: 0,
          golesAFavor: 0,
          golesEnContra: 0
        }
      });

      setNewTeam({ nombre: '', categoria: '', formato: 11, entrenador: '', asistente: '' });
      setShowNewTeamForm(false);
      loadClubData();
    } catch (error) {
      console.error('Error al crear equipo:', error);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team.id);
    setEditTeamForm({
      nombre: team.nombre,
      categoria: team.categoria,
      formato: team.formato,
      entrenador: team.entrenador,
      asistente: team.asistente
    });
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      const teamDocRef = doc(db, 'clubes', currentUser.clubId, 'equipos', editingTeam);
      await updateDoc(teamDocRef, {
        ...editTeamForm,
        formato: parseInt(editTeamForm.formato),
      });
      setEditingTeam(null);
      loadClubData();
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer.')) {
      try {
        // TODO: Verificar si hay jugadores o eventos asociados antes de eliminar
        const teamDocRef = doc(db, 'clubes', currentUser.clubId, 'equipos', teamId);
        await deleteDoc(teamDocRef);
        loadClubData();
      } catch (error) {
        console.error('Error al eliminar equipo:', error);
      }
    }
  };

  const getMaxJugadores = (formato) => {
    const limites = {
      5: 10,
      7: 14,
      8: 16,
      9: 18,
      11: 25
    };
    return limites[formato] || 25;
  };

  if (loading) {
    return <div className="loading">Cargando datos del club...</div>;
  }

  return (
    <div className="club-management">
      <div className="club-header">
        <h2>Gestión del Club: {currentUser?.club?.nombre}</h2>
        <div className="club-info">
          <p><strong>Ciudad:</strong> {currentUser?.club?.ciudad}, {currentUser?.club?.pais}</p>
          <p><strong>Equipos:</strong> {equipos.length}/12</p>
          <p><strong>Categorías:</strong> {categorias.length}</p>
        </div>
      </div>

      {/* Sección de Categorías */}
      <div className="management-section">
        <div className="section-header">
          <h3>Categorías</h3>
          <button 
            className="btn-primary"
            onClick={() => setShowNewCategoryForm(true)}
          >
            + Nueva Categoría
          </button>
        </div>

        {showNewCategoryForm && (
          <div className="form-modal">
            <form onSubmit={handleCreateCategory} className="new-category-form">
              <h4>Nueva Categoría</h4>
              <div className="input-group">
                <label>Nombre de la Categoría</label>
                <input
                  type="text"
                  value={newCategory.nombre}
                  onChange={(e) => setNewCategory({...newCategory, nombre: e.target.value})}
                  placeholder="Ej: Sub-15, Juvenil, Senior"
                  required
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Edad Mínima</label>
                  <input
                    type="number"
                    value={newCategory.edadMinima}
                    onChange={(e) => setNewCategory({...newCategory, edadMinima: e.target.value})}
                    min="5"
                    max="50"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Edad Máxima</label>
                  <input
                    type="number"
                    value={newCategory.edadMaxima}
                    onChange={(e) => setNewCategory({...newCategory, edadMaxima: e.target.value})}
                    min="5"
                    max="50"
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Descripción</label>
                <textarea
                  value={newCategory.descripcion}
                  onChange={(e) => setNewCategory({...newCategory, descripcion: e.target.value})}
                  placeholder="Descripción opcional de la categoría"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Crear Categoría</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowNewCategoryForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="categories-grid">
          {categorias.map(categoria => (
            <div key={categoria.id} className="category-card">
              <h4>{categoria.nombre}</h4>
              <p>Edades: {categoria.edadMinima} - {categoria.edadMaxima} años</p>
              {categoria.descripcion && <p className="description">{categoria.descripcion}</p>}
              <div className="category-actions">
                <button className="btn-small" onClick={() => handleEditCategory(categoria)}>Editar</button>
                <button className="btn-small btn-danger" onClick={() => handleDeleteCategory(categoria.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario de Edición de Categoría */}
        {editingCategory && (
          <div className="form-modal">
            <form onSubmit={handleUpdateCategory} className="edit-category-form">
              <h4>Editar Categoría</h4>
              <div className="input-group">
                <label>Nombre de la Categoría</label>
                <input
                  type="text"
                  value={editCategoryForm.nombre}
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Edad Mínima</label>
                  <input
                    type="number"
                    value={editCategoryForm.edadMinima}
                    onChange={(e) => setEditCategoryForm({...editCategoryForm, edadMinima: e.target.value})}
                    min="5"
                    max="50"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Edad Máxima</label>
                  <input
                    type="number"
                    value={editCategoryForm.edadMaxima}
                    onChange={(e) => setEditCategoryForm({...editCategoryForm, edadMaxima: e.target.value})}
                    min="5"
                    max="50"
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Descripción</label>
                <textarea
                  value={editCategoryForm.descripcion}
                  onChange={(e) => setEditCategoryForm({...editCategoryForm, descripcion: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Guardar Cambios</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Sección de Equipos */}
      <div className="management-section">
        <div className="section-header">
          <h3>Equipos</h3>
          <button 
            className="btn-primary"
            onClick={() => setShowNewTeamForm(true)}
            disabled={equipos.length >= 12}
          >
            + Nuevo Equipo
          </button>
        </div>

        {showNewTeamForm && (
          <div className="form-modal">
            <form onSubmit={handleCreateTeam} className="new-team-form">
              <h4>Nuevo Equipo</h4>
              <div className="input-group">
                <label>Nombre del Equipo</label>
                <input
                  type="text"
                  value={newTeam.nombre}
                  onChange={(e) => setNewTeam({...newTeam, nombre: e.target.value})}
                  placeholder="Ej: Juvenil A, Senior Masculino"
                  required
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Categoría</label>
                  <select
                    value={newTeam.categoria}
                    onChange={(e) => setNewTeam({...newTeam, categoria: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Formato de Juego</label>
                  <select
                    value={newTeam.formato}
                    onChange={(e) => setNewTeam({...newTeam, formato: e.target.value})}
                    required
                  >
                    {formatosJuego.map(formato => (
                      <option key={formato.value} value={formato.value}>
                        {formato.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Entrenador Principal</label>
                  <input
                    type="text"
                    value={newTeam.entrenador}
                    onChange={(e) => setNewTeam({...newTeam, entrenador: e.target.value})}
                    placeholder="Nombre del entrenador"
                  />
                </div>
                <div className="input-group">
                  <label>Entrenador Asistente</label>
                  <input
                    type="text"
                    value={newTeam.asistente}
                    onChange={(e) => setNewTeam({...newTeam, asistente: e.target.value})}
                    placeholder="Nombre del asistente"
                  />
                </div>
              </div>
              <div className="format-info">
                <p><strong>Formato seleccionado:</strong> Fútbol {newTeam.formato}</p>
                <p><strong>Máximo de jugadores:</strong> {getMaxJugadores(parseInt(newTeam.formato))}</p>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Crear Equipo</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowNewTeamForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="teams-grid">
          {equipos.map(equipo => (
            <div key={equipo.id} className="team-card">
              <h4>{equipo.nombre}</h4>
              <p><strong>Formato:</strong> Fútbol {equipo.formato}</p>
              <p><strong>Jugadores:</strong> {equipo.jugadores?.length || 0}/{getMaxJugadores(equipo.formato)}</p>
              {equipo.entrenador && <p><strong>Entrenador:</strong> {equipo.entrenador}</p>}
              <div className="team-actions">
                <button className="btn-small" onClick={() => handleEditTeam(equipo)}>Editar</button>
                <button className="btn-small btn-danger" onClick={() => handleDeleteTeam(equipo.id)}>Eliminar</button>
                <button className="btn-small">Gestionar</button>
                <button className="btn-small">Estadísticas</button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario de Edición de Equipo */}
        {editingTeam && (
          <div className="form-modal">
            <form onSubmit={handleUpdateTeam} className="edit-team-form">
              <h4>Editar Equipo</h4>
              <div className="input-group">
                <label>Nombre del Equipo</label>
                <input
                  type="text"
                  value={editTeamForm.nombre}
                  onChange={(e) => setEditTeamForm({...editTeamForm, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Categoría</label>
                  <select
                    value={editTeamForm.categoria}
                    onChange={(e) => setEditTeamForm({...editTeamForm, categoria: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Formato de Juego</label>
                  <select
                    value={editTeamForm.formato}
                    onChange={(e) => setEditTeamForm({...editTeamForm, formato: e.target.value})}
                    required
                  >
                    {formatosJuego.map(formato => (
                      <option key={formato.value} value={formato.value}>
                        {formato.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Entrenador Principal</label>
                  <input
                    type="text"
                    value={editTeamForm.entrenador}
                    onChange={(e) => setEditTeamForm({...editTeamForm, entrenador: e.target.value})}
                    placeholder="Nombre del entrenador"
                  />
                </div>
                <div className="input-group">
                  <label>Entrenador Asistente</label>
                  <input
                    type="text"
                    value={editTeamForm.asistente}
                    onChange={(e) => setEditTeamForm({...editTeamForm, asistente: e.target.value})}
                    placeholder="Nombre del asistente"
                  />
                </div>
              </div>
              <div className="format-info">
                <p><strong>Formato seleccionado:</strong> Fútbol {editTeamForm.formato}</p>
                <p><strong>Máximo de jugadores:</strong> {getMaxJugadores(parseInt(editTeamForm.formato))}</p>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Guardar Cambios</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setEditingTeam(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClubManagement;
