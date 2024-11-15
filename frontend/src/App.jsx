import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import personsService from './services/persons';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import Persons from './components/Persons';
import Notification from './components/Notification';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [filter, setFilter] = useState('');
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [personId, setPersonId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState({
    message: '',
    errorMessages: [],
    type: '',
  });
  const [timeoutId, setTimeoutId] = useState(null);
  const [showMessage, setShowMessage] = useState(false);

  // Remember to run server in terminal: npm run server
  // React Hook useEffect
  useEffect(() => {
    personsService
      .getAll()
      .then((data) => {
        setPersons(data);
      })
      .catch((error) => {
        console.error(`${error.message}: Did you remember to start server?`);
        console.warn('Run in terminal: npm run server');
      });
  }, []);

  const regexp = new RegExp(filter, 'i');
  const personsToShow =
    filter === ''
      ? persons
      : persons.filter((person) => regexp.test(person.name));

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilter(value);
    filterPersons(value);
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  /**
   * Add new person or update in edit mode
   * @param {object} event
   */
  const add = (event) => {
    event.preventDefault();
    const personObj = {
      name: newName,
      number: newNumber,
    };
    if (isEditMode) {
      personObj.id = personId;
      personsService
        .update(personObj)
        .then((data) => {
          setPersons(
            persons.map((person) =>
              person.id !== data.person.id ? person : data.person
            )
          );
          showNotification(data, 'primary');
          setIsEditMode(false);
          clear();
        })
        .catch((error) => {
          console.log('error', error);
          showNotification(error.response.data, 'danger');
          // Clean up a person not found in the list
          // updatePersons(personObj);
        });
    } else {
      personsService
        .create(personObj)
        .then((data) => {
          setPersons(persons.concat(data.person));
          showNotification(data, 'success');
          clear();
        })
        .catch((error) => {
          showNotification(error.response.data, 'danger');
        });
    }
  };

  const edit = (person) => {
    setNewName(person.name);
    setNewNumber(person.number);
    setPersonId(person.id);
    setIsEditMode(true);
  };

  const cancel = () => {
    setIsEditMode(false);
    clear();
  };

  const clear = () => {
    setNewName('');
    setNewNumber('');
    setPersonId(null);
  };

  const remove = (person) => {
    if (confirm(`Delete ${person.name}?`)) {
      personsService
        .remove(person.id)
        .then((data) => {
          showNotification(data, 'info');
          updatePersons(person);
        })
        .catch((error) => {
          if (error.status === 404) {
            showNotification(error.response.data, 'danger');
            updatePersons(person);
          }
        });
    }
  };

  const updatePersons = (person) => {
    const updatedPersons = persons.filter((p) => p.id !== person.id);
    setPersons(updatedPersons);
  };

  const showNotification = (data, type) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setNotification({
      message: data.message,
      messages: data.messages,
      type: type,
    });
    setShowMessage(true);

    const newTimeoutId = setTimeout(() => {
      setShowMessage(false);
    }, 5000);
    setTimeoutId(newTimeoutId);
  };

  return (
    <div className='container'>
      <h1>Phonebook</h1>
      <div className={`notification-container ${showMessage ? 'show' : ''}`}>
        <Notification notification={notification} />
        {/* <div className={`notification ${notification.type}`}>
          {notification.message}
        </div> */}
      </div>
      <Filter filter={filter} onFilterChange={handleFilterChange} />

      <h3>{isEditMode ? 'Edit person information' : 'Add a new'}</h3>
      <PersonForm
        submit={add}
        name={newName}
        onNameChange={handleNameChange}
        number={newNumber}
        onNumberChange={handleNumberChange}
        isEditMode={isEditMode}
        cancel={cancel}
      />
      <h3>Numbers</h3>
      <Persons personsToShow={personsToShow} remove={remove} edit={edit} />
    </div>
  );
};

export default App;
