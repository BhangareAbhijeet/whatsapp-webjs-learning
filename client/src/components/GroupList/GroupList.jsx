import "./GroupList.css";

function GroupList({ groups, selectedGroups, toggleGroup, loading }) {
  return (
    <div className="group-list-card">
      <div className="group-list-header">
        <h2>WhatsApp Groups</h2>
        <span className="group-selected-count">{selectedGroups.length} selected</span>
      </div>

      {loading && <p className="group-empty">Loading groups...</p>}

      {!loading && groups.length === 0 && <p className="group-empty">No groups found.</p>}

      <div className="group-list-items">
        {groups.map((group) => {
          const isSelected = selectedGroups.includes(group.id);

          return (
            <label key={group.id} className={`group-item ${isSelected ? "selected" : ""}`}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleGroup(group.id)}
              />
              <span className="group-name">{group.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default GroupList;
