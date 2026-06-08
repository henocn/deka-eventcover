import { Filter, Plus, Search } from 'lucide-react';
import { eventFilters } from '../../utils/eventUtils';

function EventToolbar({ query, filter, onQueryChange, onFilterChange, onCreate }) {
  return (
    <div className="table-toolbar compact-toolbar">
      <div className="filter-select">
        <Filter size={16} />
        <select value={filter} onChange={(event) => onFilterChange(event.target.value)}>
          {eventFilters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-actions">
        <label className="search-control">
          <Search size={16} />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search" />
        </label>
        <button type="button" className="primary-button create-button" onClick={onCreate}>
          <Plus size={16} />
          Creer
        </button>
      </div>
    </div>
  );
}

export default EventToolbar;
