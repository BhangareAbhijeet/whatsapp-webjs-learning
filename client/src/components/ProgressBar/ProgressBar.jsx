import "./ProgressBar.css";

function ProgressBar({ completed, total }) {

  const percentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="progress-card">

      <h2>Sending Progress</h2>

      <div className="progress-track">

        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
          }}
        ></div>

      </div>

      <p>
        {completed} / {total} Messages
      </p>

      <h3>{percentage}%</h3>

    </div>
  );
}

export default ProgressBar;