const express = require('express');
const morgan = require('morgan')
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3001;

morgan.token('post-data', (req) => {
  if ([ 'POST', 'PUT', 'PATCH' ].includes(req.method)) {
    return JSON.stringify(req.body);
  }
  return ''
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'));
app.use(cors())
app.use(express.static('dist'))

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const person = persons.find(p => p.id === id);
  if (!person) {
    return res.status(404).json({ error: 'Person not found' });
  }
  res.json(person);
});

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body;
  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' });
  }
  if (persons.find(p => p.name === name)) {
    return res.status(400).json({ error: 'Name must be unique' });
  }
  const newPerson = {
    id: (Math.random() * 1000000).toFixed(0),
    name,
    number
  };
  persons.push(newPerson);
  res.status(201).json(newPerson);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const personIndex = persons.findIndex(p => p.id === id);
  if (personIndex === -1) {
    return res.status(404).json({ error: 'Person not found' });
  }
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});

app.get('/info', (req, res) => {
  res.send(`Phonebook has info for 2 people <br> ${new Date()}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});