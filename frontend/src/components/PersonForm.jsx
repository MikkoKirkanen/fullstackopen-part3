const PersonForm = ({
  submit,
  name,
  onNameChange,
  number,
  onNumberChange,
  isEditMode,
  cancel,
}) => (
  <form onSubmit={submit}>
    <table>
      <tbody>
        <tr>
          <td>Name: </td>
          <td>
            <input value={name} onChange={onNameChange} />
          </td>
        </tr>
        <tr>
          <td>Number: </td>
          <td>
            <input value={number} onChange={onNumberChange} />
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="submit">{isEditMode ? "Update" : "Add"}</button>
              <button type="reset" onClick={cancel}>{isEditMode ? "Cancel" : "Clear"}</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </form>
);

export default PersonForm;
