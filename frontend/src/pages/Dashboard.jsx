import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '', page: 1 });
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
  };

  const fetchTasks = useCallback(async (params) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.status !== 'all') query.set('status', params.status);
      if (params.priority !== 'all') query.set('priority', params.priority);
      if (params.search) query.set('search', params.search);
      query.set('page', params.page);
      query.set('limit', 9);

      const res = await api.get(`/tasks?${query}`);
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(filters);
  }, [filters, fetchTasks]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    }, 400);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleAddTask = async (data) => {
    try {
      const res = await api.post('/tasks', data);
      toast.success('Task added!');
      setFilters((prev) => ({ ...prev, page: 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task');
      throw err;
    }
  };

  const handleEditTask = async (data) => {
    try {
      await api.put(`/tasks/${editTask._id}`, data);
      toast.success('Task updated!');
      fetchTasks(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/toggle`);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      setDeleteConfirm(null);
      fetchTasks(filters);
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const openEdit = (task) => { setEditTask(task); setShowModal(true); };
  const openAdd = () => { setEditTask(null); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTask(null); };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#6366f1"/>
            <path d="M12 20l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>TaskFlow</span>
        </div>
        <div className="navbar-right">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span className="user-name">{user?.name}</span>
          <button className="btn-logout" onClick={logout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!</h1>
            <p>Here&apos;s what&apos;s on your plate today.</p>
          </div>
          <button className="btn-primary btn-add" onClick={openAdd}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3.75v10.5M3.75 9h10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Task
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12h8M8 8h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="stat-value">{pagination.total}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card stat-done">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="stat-value">
                {pagination.total > 0 ? Math.round((stats.completed / pagination.total) * 100) : 0}%
              </span>
              <span className="stat-label">Completed Rate</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search tasks..."
              onChange={handleSearchChange}
              defaultValue={filters.search}
            />
          </div>

          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="loader" />
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="39" stroke="#e5e7eb" strokeWidth="2"/>
              <path d="M25 40h30M25 30h30M25 50h20" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <h3>No tasks found</h3>
            <p>{filters.search || filters.status !== 'all' || filters.priority !== 'all'
              ? 'Try adjusting your filters'
              : 'Click "Add Task" to create your first task!'}</p>
            {!filters.search && filters.status === 'all' && filters.priority === 'all' && (
              <button className="btn-primary" onClick={openAdd}>Add your first task</button>
            )}
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onEdit={openEdit}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={filters.page === 1}
              onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${filters.page === p ? 'active' : ''}`}
                onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={filters.page === pagination.pages}
              onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </main>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editTask}
          onSave={editTask ? handleEditTask : handleAddTask}
          onClose={closeModal}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Delete Task</h3>
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
