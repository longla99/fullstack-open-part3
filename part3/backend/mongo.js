const mongoose = require('mongoose')

if (process.argv.length < 3 || process.argv.length === 4 || process.argv.length > 5) {
  console.log('Usage: node mongo.js <password> [name] [number]')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://long_99:${password}@cluster0.ndlpuqm.mongodb.net/Persons?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const phoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const PhoneBook = mongoose.model('Person', phoneBookSchema)

const phoneBookEntry = new PhoneBook({
  name,
  number
})

if (name && number) {
  phoneBookEntry.save().then(result => {
    console.log('added', result.name, 'number', result.number, 'to phonebook')
    mongoose.connection.close()
  })
} else {
  PhoneBook.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(entry => {
      console.log(entry.name, entry.number)
    })
    mongoose.connection.close()
  })
}

