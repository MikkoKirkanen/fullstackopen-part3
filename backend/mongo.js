import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const url = `mongodb+srv://mikkokirkanen:${process.env.MONGODB_PW}@cluster0.bf8dw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv[2]) {
  const person = new Person({
    name: process.argv[2],
    number: process.argv[3],
  })

  person.save().then(() => {
    console.log('person saved!')
    mongoose.connection.close()
  })
} else {
  Person.find({}).then(persons => {
    console.log('Phonebook:')
    persons.forEach(person => console.log(`${person.name} ${person.number}`))
    mongoose.connection.close()
  })
}
