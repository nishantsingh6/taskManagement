const Task = require('../models/Task');

const getTasks = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 9 } = req.query;

    const filter = { userId: req.user._id };
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    res.json({
      tasks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || title.trim().length < 2) {
      return res.status(400).json({ message: 'Title must be at least 2 characters' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      userId: req.user._id,
    });

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, priority } = req.body;
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;

    await task.save();
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    await task.save();
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle task', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, toggleTask, deleteTask };
