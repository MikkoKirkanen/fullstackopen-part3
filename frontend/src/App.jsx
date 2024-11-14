import { useState, useEffect } from 'react';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import Persons from './components/Persons';
import personsService from './services/persons';
import './index.css';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [filter, setFilter] = useState('');
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [personId, setPersonId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [timeoutId, setTimeoutId] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [nextId, setNextId] = useState(null);

  // Remember to run server in terminal: npm run server
  // React Hook useEffect
  useEffect(() => {
    personsService
      .getAll()
      .then((data) => {
        setPersons(data);
        initNextId(data);
      })
      .catch((error) => {
        console.error(`${error.message}: Did you remember to start server?`);
        console.warn('Run in terminal: npm run server');
      });
  }, []);

  const initNextId = (data) => {
    setNextId(Math.max(...data.map((person) => person.id)) + 1);
  };

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
    if (hasInvalidData()) {
      return;
    }
    const id = isEditMode ? personId : nextId.toString();
    const personObj = {
      name: newName,
      number: newNumber,
      id: id,
    };
    if (isEditMode) {
      personsService
        .update(personObj)
        .then((data) => {
          setPersons(
            persons.map((person) => (person.id !== data.id ? person : data))
          );
          showNotification(`${data.name} has been updated`, 'primary');
          setIsEditMode(false);
          clear();
        })
        .catch(() => {
          showNotification(
            `Information of ${personObj.name} has not found`,
            'danger'
          );
          setIsEditMode(false);
          // Clean up a person not found in the list
          updatePersons(personObj);
          clear();
        });
    } else {
      personsService.create(personObj).then((data) => {
        setPersons(persons.concat(data));
        showNotification(`Added ${data.name}`, 'success');
        setNextId(nextId + 1);
        clear();
      });
    }
  };

  /**
   * Checks the validity of data.
   * @returns {boolean} `false` if data is valid, `true` if data is invalid.
   */
  const hasInvalidData = () => {
    const type = 'danger';
    if (newName === '') {
      showNotification('Name is empty! Add name, please.', type);
      return true;
    }
    if (persons.some((person) => person.name === newName && !isEditMode)) {
      showNotification(`${newName} is already added to phonebook`, type);
      return true;
    }
    if (newNumber === '') {
      showNotification(
        `Number is empty! Add ${newName}'s number, please.`,
        type
      );
      return true;
    }
    return false;
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
  };

  const remove = (person) => {
    if (confirm(`Delete ${person.name}?`)) {
      personsService.remove(person.id).then((person) => {
        showNotification(`${person.name} has been deleted`, 'info');
        updatePersons(person);
      });
    }
  };

  const updatePersons = (person) => {
    const updatedPersons = persons.filter((p) => p.id !== person.id);
    setPersons(updatedPersons);
  };

  const showNotification = (text, type) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setNotification({ message: text, type: type });
    setShowMessage(true);

    const newTimeoutId = setTimeout(() => {
      setShowMessage(false);
    }, 5000);
    setTimeoutId(newTimeoutId);
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <div className={`notification-container ${showMessage ? 'show' : ''}`}>
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
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
