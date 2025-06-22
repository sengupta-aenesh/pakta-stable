export function SidebarSearch({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="sidebar-search">
      <input
        type="text"
        placeholder="Search folders"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}