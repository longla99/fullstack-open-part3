const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

require('dotenv').config()

const Person = require('./models/person')


const app = express()
const PORT = process.env.PORT || 3001

morgan.token('post-data', (req) => {
  if ([ 'POST', 'PUT', 'PATCH' ].includes(req.method)) {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).json({ error: 'Person not found' })
    }
  }).catch((error) => {
    next(error)
  })
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body
  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' })
  }
  const newPerson = new Person({
    name,
    number
  })
  newPerson.save().then(savedPerson => {
    res.status(201).json(savedPerson)
  }).catch((error) => {
    next(error)
  })
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const { name, number } = req.body
  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' })
  }
  Person.findByIdAndUpdate(id, { name, number }, { returnDocument: 'after', runValidators: true }).then(updatedPerson => {
    if (updatedPerson) {
      res.json(updatedPerson)
    } else {
      res.status(404).json({ error: 'Person not found' })
    }
  }).catch((error) => {
    next(error)
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id).then(() => {
    res.status(204).end()
  }).catch((error) => {
    next(error)
  })
})

app.get('/api/info', (req, res) => {
  Person.countDocuments({}).then(count => {
    const info = `Phonebook has info for ${count} people`
    const date = new Date()
    res.send(`${info}<br>${date}`)
  })
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})