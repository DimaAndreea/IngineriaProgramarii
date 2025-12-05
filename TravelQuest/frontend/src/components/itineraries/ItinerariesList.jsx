import React from "react";

function computeStatus(start_date, end_date) {
  const now = new Date();
  const s = new Date(start_date);
  const e = new Date(end_date);

  if (now < s) return "UPCOMING";
  if (now > e) return "FINISHED";
  return "ACTIVE";
}

export default function ItinerariesList({ itineraries, onEdit, onDelete }) {
  return (
    <div className="itineraries-list">
      <h2>Lista itinerariilor</h2>

      {itineraries.length === 0 && <p>Nu există itinerarii.</p>}

      {itineraries.length > 0 && (
        <table className="itineraries-table">
          <thead>
            <tr>
              <th>Titlu</th>
              <th>Categorie</th>
              <th>Locație</th>
              <th>Preț</th>
              <th>Perioadă</th>
              <th>Status</th>
              <th>Acțiuni</th>
            </tr>
          </thead>

          <tbody>
            {itineraries.map((it) => (
              <tr key={it.id}>
                <td>{it.title}</td>
                <td>{it.category}</td>
                <td>{it.location}</td>
                <td>{it.price} RON</td>
                <td>
                  {it.start_date} → {it.end_date}
                </td>
                <td>{computeStatus(it.start_date, it.end_date)}</td>

                <td>
                  <button onClick={() => onEdit(it)}>Editează</button>
                  <button
                    className="button-danger"
                    onClick={() => onDelete(it.id)}
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
