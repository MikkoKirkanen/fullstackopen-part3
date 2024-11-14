const Filter = (props) => {
  return (
    <div>
      Filter by name: <input value={props.filter} onChange={props.onFilterChange} />
    </div>
  );
};

export default Filter;
