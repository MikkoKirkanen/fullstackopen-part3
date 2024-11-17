import Table from 'react-bootstrap/Table';

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
    <Table className='person-input-table' borderless size='sm'>
      <tbody>
        <tr>
          <td className='align-middle w-auto'>
            <label htmlFor='name'>Name</label>
          </td>
          <td>
            <input
              id='name'
              name='name'
              className='form-control'
              autoComplete='off'
              value={name}
              onChange={onNameChange}
            />
          </td>
        </tr>
        <tr>
          <td className='align-middle w-auto'>
            <label htmlFor='number'>Number</label>
          </td>
          <td>
            <input
              id='number'
              name='number'
              className='form-control'
              autoComplete='off'
              value={number}
              onChange={onNumberChange}
            />
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type='submit'
                className={'btn btn-' + (isEditMode ? 'primary' : 'success')}
              >
                {isEditMode ? 'Update' : 'Add'}
              </button>
              <button
                type='reset'
                className='btn btn-secondary'
                onClick={cancel}
              >
                {isEditMode ? 'Cancel' : 'Clear'}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </Table>
  </form>
);

export default PersonForm;
