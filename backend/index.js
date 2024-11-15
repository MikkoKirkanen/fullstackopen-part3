import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

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

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: '1',
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: '2',
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: '3',
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: '4',
  },
  {
    id: '5',
    name: 'Mikko Kirkanen',
    number: '044 2708 279',
  },
];

// Get last id and let it be changeable
let lastId = persons.length
  ? Math.max(...persons?.map((person) => Number(person.id)))
  : 0;

const trimValues = (person) => {
  person.name = person.name.trim();
  person.number = person.number.trim();
};

const hasEmptyOrSameNameValues = (person) => {
  trimValues(person);
  const result = { hasErrors: false, messages: [] };
  const noName = !person.name;
  const noNumber = !person.number;
  result.hasErrors = noName || noNumber;
  if (result.hasErrors) {
    noName ? result.messages.push('Name is required') : null;
    noNumber ? result.messages.push('Number is required') : null;
  } else if (
    persons
      .filter((p) => p.id !== person?.id)
      .some((p) => p.name === person?.name)
  ) {
    result.messages.push(`${person.name} is already in the phonebook`);
    result.hasErrors = true;
  }
  return result;
};

app.get('/', (_request, response) => {
  response.send(`<h1>Hello World!</h1>`);
});

app.get('/info', (_request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  );
});

app.get('/api/persons', (_request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const result = persons.find((person) => person.id === request.params.id);
  result ? response.json(result) : response.sendStatus(404);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const person = persons.find(p => p.id === id)
  if (!person) {
    res.status(404).json({
      message: 'Person not found in phonebook',
      messages: ['The person is removed from the phonebook.']
    });
    return;
  }
  persons = persons.filter((person) => person.id !== id);
  res.status(200).json({
      message: `${person.name} has been removed from the phonebook`,
  });
});

app.post('/api/persons', (req, res) => {
  const person = { ...req.body };
  const errors = hasEmptyOrSameNameValues(person);
  if (errors.hasErrors) {
    res.status(400).json({
      message: 'Failed to add person to phonebook',
      messages: errors.messages,
    });
    return;
  }
  // Increase lastId before adding it to id and convert that to string
  person.id = (++lastId).toString();
  // Not good way because might cause conflicts
  // person.id = (Math.floor(Math.random() * 10000)).toString();
  persons.push(person);
  res.status(200).json({
    message: `${person.name} has been successfully added to the phonebook`,
    person: person});
});

app.put('/api/persons', (req, res) => {
  const newData = req.body;
  const errors = hasEmptyOrSameNameValues(newData);
  if (errors.hasErrors) {
    res.status(400).json({
      message: 'Person update failed',
      messages: errors.messages,
    });
    return;
  }
  const person = persons.find((person) => person.id === newData.id);
  person.name = newData.name;
  person.number = newData.number;
  res.status(200).json({
    message: `${person.name} has been updated successfully`,
    person: person,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
