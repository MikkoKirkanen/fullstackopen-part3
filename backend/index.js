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
app.use(express.static('dist'))

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

app.delete('/api/persons/:id', (request, response) => {
  persons = persons.filter((person) => person.id !== request.params.id);
  response.sendStatus(204);
});

app.post('/api/persons', (request, response) => {
  const person = { ...request.body };
  const isOnList = persons.some((p) => p.name === person?.name);
  if (!person?.name || !person?.number || isOnList) {
    let error = '';
    if (!person?.name) {
      error = 'Name is empty';
    } else if (!person?.number) {
      error = 'Number is empty';
    } else if (!person?.isOnList) {
      error = 'The person is already in the phonebook';
    }
    response.status(400).json({
      error: error,
    });
    return;
  }
  // Increase lastId before adding it to id and convert that to string
  person.id = (++lastId).toString();
  // No good way because might cause conflicts
  // person.id = (Math.floor(Math.random() * 10000)).toString();
  persons.push(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
