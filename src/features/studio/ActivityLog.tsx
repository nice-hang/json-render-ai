import type { ActivityEntry } from '../../core'

export function ActivityLog({
  entries,
}: {
  entries: readonly ActivityEntry[]
}) {
  if (!entries.length)
    return (
      <p className="empty-state">
        Commands from people and agents will appear here.
      </p>
    )
  return (
    <ol className="activity-list" aria-label="Command activity">
      {entries.map((entry) => (
        <li key={entry.id}>
          <div className="activity-meta">
            <span className={`source-chip source-chip--${entry.source}`}>
              {entry.source}
            </span>
            <time dateTime={entry.timestamp}>
              {new Date(entry.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </time>
          </div>
          <strong>{entry.command}</strong>
          <p>{entry.summary}</p>
          <span className={`activity-status activity-status--${entry.status}`}>
            {entry.status}
          </span>
        </li>
      ))}
    </ol>
  )
}
