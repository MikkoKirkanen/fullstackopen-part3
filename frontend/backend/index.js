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
  person.name = person.name?.trim();
  person.number = person.number?.trim();
};

const getErrorTitle = (isAdd = true) => {
  return `Failed to ${isAdd ? 'add' : 'update'} person to phonebook`;
};

const checkEmptyValues = (person) => {
  trimValues(person);
  const result = {
    hasErrors: false,
    message: null,
    messages: [],
    status: null,
  };
  const noName = !person.name;
  const noNumber = !person.number;
  result.hasErrors = noName || noNumber;
  if (result.hasErrors) {
    result.status = 400;
    result.message = getErrorTitle(!person.id);
    noName ? result.messages.push('Name is required') : null;
    noNumber ? result.messages.push('Number is required') : null;
  }
  return result;
};

const hasMissingIdOrSameName = async (person) => {
  const result = { hasErrors: false, messages: [], status: 400 };
  const persons = await Person.find({});
  const hasMissingId =
    person.id && !persons.find((p) => p._id.toString() === person.id);
  const hasSameNamePerson = persons
    .filter((p) => p._id.toString() !== person?.id)
    .some((p) => p.name === person.name);
  result.hasErrors = hasMissingId || hasSameNamePerson;
  result.message = result.hasErrors ? getErrorTitle(!person.id) : null;
  if (hasMissingId) {
    result.messages.push(`Person ${person.name} not found`);
    result.status = 404;
  } else if (hasSameNamePerson) {
    result.messages.push(`${person.name} is already in the phonebook`);
  }
  return result;
};

// Middleware to check for empty values when add and update
app.use('/api/persons', (req, res, next) => {
  const isAddOrUpdateMethod = req.method === 'POST' || req.method === 'PUT';
  const result = checkEmptyValues(req.body);
  if (isAddOrUpdateMethod && result.hasErrors) {
    next(result);
  } else {
    next();
  }
});

app.get('/test', (_req, res) => {
  res.send(`<h1>Hello World!</h1>`);
});

app.get('/info', (_req, res) => {
  Person.find({}).then((persons) =>
    res.send(
      `<p>Phonebook has info for ${
        persons.length
      } people</p><p>${new Date().toLocaleString()}</p>`
    )
  );
});

app.get('/api/persons', (_req, res, next) => {
  Person.find({})
    .then((persons) => {
      next({ status: 200, persons: persons });
    })
    .catch((error) => {
      next({ status: 404, message: `Error getting persons: ${error}` });
    });
});

app.get('/api/persons/:id', async (req, res) => {
  Person.findById(req.params.id)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.sendStatus(404);
    });
});

app.post('/api/persons', async (req, res, next) => {
  const newPerson = req.body;
  const errors = await hasMissingIdOrSameName(newPerson);
  if (errors.hasErrors) {
    next(errors);
  } else {
    const person = new Person({
      name: newPerson.name,
      number: newPerson.number,
    });
    person.save().then(() =>
      next({
        status: 201,
        message: `Person ${newPerson.name} has been successfully added to the phonebook`,
        person: person,
      })
    );
  }
});

app.put('/api/persons', async (req, res, next) => {
  const person = req.body;
  const errors = await hasMissingIdOrSameName(person);
  if (errors.hasErrors) {
    next(errors);
  } else {
    Person.findByIdAndUpdate(
      person.id,
      {
        name: person.name,
        number: person.number,
      },
      { new: true }
    )
      .then((person) => {
        next({
          message: `Person ${person.name} has been updated successfully`,
          person: person,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((person) => {
      if (person) {
        next({
          message: `Person ${person.name} has been removed from the phonebook`,
          person: person,
        });
      } else {
        next({ status: 404, message: 'The person to be deleted cannot be found' });
      }
    })
    .catch((error) => {
      console.log('Delete error', error);
    });
});

// Middleware for response
app.use((result, req, res, next) => {
  res.status(result.status || 200).json({
    message: result.message,
    messages: result.messages,
    person: result.person,
    persons: result.persons
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
