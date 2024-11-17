import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connection.js';
import Person from './models/person.js';

dotenv.config();

connectDB();

const app = express();
app.use(express.json());
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-json'
  )
);
morgan.token('req-json', (req) => {
  return JSON.stringify(req.body);
});
app.use(cors());
app.use(express.static('dist'));

const trimValues = (person) => {
  person.name = person.name.trim();
  person.number = person.number.trim();
};

const hasEmptyOrSameNameValues = async (person) => {
  trimValues(person);
  const result = { hasErrors: false, messages: [], status: null };
  const noName = !person.name;
  const noNumber = !person.number;
  result.hasErrors = noName || noNumber;
  const persons = await Person.find({}).then((persons) => persons);
  if (result.hasErrors) {
    noName ? result.messages.push('Name is required') : null;
    noNumber ? result.messages.push('Number is required') : null;
  } else if (
    person.id &&
    !persons.find((p) => p._id.toString() === person.id)
  ) {
    result.messages.push(`${person.name} no found`);
    result.hasErrors = true;
    result.status = 404;
  } else if (
    persons
      .filter((p) => p._id.toString() !== person?.id)
      .some((p) => p.name === person?.name)
  ) {
    result.messages.push(`${person.name} is already in the phonebook`);
    result.hasErrors = true;
  }
  return result;
};

app.get('/test', (_req, res) => {
  res.send(`<h1>Hello World!</h1>`);
});

app.get('/info', (_req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  );
});

app.get('/api/persons', (_req, res) => {
  Person.find({})
    .then((persons) => {
      res.status(200).json({ persons: persons });
    })
    .catch((error) => {
      res.status(404).json({ message: `Error getting persons: ${error}` });
    });
});

app.get('/api/persons/:id', async (req, res) => {
  Person.findById(req.params.id)
    .then((result) => {
      console.log(result);
      res.json(result);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(404);
    });
});

app.post('/api/persons', async (req, res) => {
  const newPerson = { ...req.body };
  const errors = await hasEmptyOrSameNameValues(newPerson);
  if (errors.hasErrors) {
    res.status(400).json({
      message: 'Failed to add person to phonebook',
      messages: errors.messages,
    });
    return;
  }
  const person = new Person({
    name: newPerson.name,
    number: newPerson.number,
  });
  person.save().then(() =>
    res.status(201).json({
      message: `${newPerson.name} has been successfully added to the phonebook`,
      person: person,
    })
  );
});

app.put('/api/persons', async (req, res) => {
  const newData = req.body;
  const errors = await hasEmptyOrSameNameValues(newData);
  if (errors.hasErrors) {
    res.status(errors.status || 400).json({
      message: 'Person update failed',
      messages: errors.messages,
    });
    return;
  }
  Person.findByIdAndUpdate(
    newData.id,
    {
      name: newData.name,
      number: newData.number,
    },
    { new: true }
  )
    .then((person) => {
      res.status(200).json({
        message: `${person.name} has been updated successfully`,
        person: person,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

app.delete('/api/persons/:id', async (req, res) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((data) => {
      if (data) {
        res.status(200).json({
          message: `${data.name} has been removed from the phonebook`,
          person: data,
        });
      } else {
        res.status(404).json({
          message: 'The person to delete cannot be found',
        });
      }
    })
    .catch((error) => {
      console.log('Delete error', error);
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
