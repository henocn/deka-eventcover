import { Filter, Plus, Search } from 'lucide-react';
import { Button } from '../ui';
import { eventFilters } from '../../utils/eventUtils';

function EventToolbar({ query, filter, onQueryChange, onFilterChange, onCreate }) {
  return (
    <div className="flex items-center justify-between gap-3.5 border-b border-neutral-200 px-5 py-3.5 max-[1180px]:flex-col max-[1180px]:items-start">
      <div className="inline-grid min-h-[38px] grid-cols-[18px_minmax(118px,auto)] items-center gap-2 rounded border border-neutral-200 bg-white px-2.5">
        <Filter size={16} />
        <select className="border-0 bg-transparent font-extrabold text-neutral-950 outline-none" value={filter} onChange={(event) => onFilterChange(event.target.value)}>
          {eventFilters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2.5 max-[1180px]:w-full max-[760px]:flex-col max-[760px]:items-stretch">
        <label className="grid min-h-[38px] w-[min(280px,32vw)] grid-cols-[18px_minmax(0,1fr)] items-center gap-2 rounded border border-neutral-200 px-3 text-neutral-950 max-[1180px]:w-full">
          <Search size={16} />
          <input className="min-h-9 border-0 bg-transparent p-0 outline-none" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search" />
        </label>
        <Button className="min-w-[104px]" onClick={onCreate}>
          <Plus size={16} />
          Creer
        </Button>
      </div>
    </div>
  );
}

export default EventToolbar;
