import React, { useEffect, useState } from 'react';

const API_BASE = '/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Cargando');
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    try {
      const [healthRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/tasks`)
      ]);

      const health = await healthRes.json();
      const tasksData = await tasksRes.json();

      setStatus(health.ok ? 'Backend conectado' : 'Backend no disponible');
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch {
      setStatus('No se pudo conectar con el backend');
      setTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() })
      });
      setTitle('');
      await loadTasks();
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id) => {
    await fetch(`${API_BASE}/tasks/${id}/toggle`, { method: 'PATCH' });
    await loadTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    await loadTasks();
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Mini Tasks App</h1>

        <div className="status">
          <strong>Estado:</strong> {status}
        </div>

        <form className="form" onSubmit={createTask}>
          <input
            type="text"
            placeholder="Escribe una tarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando' : 'Agregar'}
          </button>
        </form>

        <ul className="taskList">
          {tasks.length === 0 ? (
            <li className="empty">No hay tareas registradas.</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="taskItem">
                <label>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className={task.done ? 'done' : ''}>{task.title}</span>
                </label>
                <button className="danger" onClick={() => deleteTask(task.id)}>
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}