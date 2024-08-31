const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


mongoose.connect('mongodb://localhost:27017/todos');

const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
});

const Todo = mongoose.model('Todo', todoSchema);


app.get('/api/todos', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    try {
      const todos = await Todo.find().skip(skip).limit(limit);
      const total = await Todo.countDocuments();
      res.json({
        todos,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.post('/api/todos', async (req, res) => {
  const { title, description, date } = req.body;

  const newTodo = new Todo({
    title,
    description,
    date,
  });

  try {
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
  } catch (err) {
    res.status(500).send(err);
  }
});


app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).send(err);
  }
});


app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Todo.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).send(err);
  }
});


app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
