const Persons = ({ personsToShow, remove, edit }) => (
  <table className="table table-sm table-striped">
    <tbody>
      {personsToShow?.map((person) => (
        <tr key={person.id}>
          <td className="align-middle">{person.name}</td>
          <td className="align-middle">{person.number}</td>
          <td className="text-end">
            <button className="btn btn-warning me-3" onClick={() => edit(person)}>Edit</button>
            <button className="btn btn-danger" onClick={() => remove(person)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default Persons;
