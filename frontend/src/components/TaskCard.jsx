const priorityConfig = {
  low: { label: 'Low', className: 'badge-low' },
  medium: { label: 'Medium', className: 'badge-medium' },
  high: { label: 'High', className: 'badge-high' },
};

const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const isCompleted = task.status === 'completed';
  const { label, className } = priorityConfig[task.priority] || priorityConfig.medium;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`task-card ${isCompleted ? 'task-completed' : ''}`}>
      <div className="task-card-top">
        <button
          className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
          onClick={() => onToggle(task._id)}
          aria-label={isCompleted ? 'Mark pending' : 'Mark complete'}
        >
          {isCompleted && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <div className="task-content">
          <h3 className={`task-title ${isCompleted ? 'strikethrough' : ''}`}>{task.title}</h3>
          {task.description && <p className="task-desc">{task.description}</p>}
        </div>
      </div>

      <div className="task-card-bottom">
        <div className="task-meta">
          <span className={`priority-badge ${className}`}>{label}</span>
          <span className="task-date">{formatDate(task.createdAt)}</span>
        </div>
        <div className="task-actions">
          <button className="action-btn edit-btn" onClick={() => onEdit(task)} aria-label="Edit task">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.333 2a1.885 1.885 0 012.667 2.667L5.333 13.333l-3.666.667.666-3.667L11.333 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="action-btn delete-btn" onClick={() => onDelete(task._id)} aria-label="Delete task">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333A1.333 1.333 0 005.333 14.6h5.334a1.333 1.333 0 001.333-1.267L12.667 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
