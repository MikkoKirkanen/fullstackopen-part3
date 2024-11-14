const Persons = ({ personsToShow, remove, edit }) => (
  <table>
    <tbody>
      {personsToShow?.map((person) => (
        <tr key={person.id}>
          <td>{person.name}</td>
          <td>{person.number}</td>
          <td>
            <button onClick={() => edit(person)}>Edit</button>
          </td>
          <td>
            <button onClick={() => remove(person)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default Persons;
