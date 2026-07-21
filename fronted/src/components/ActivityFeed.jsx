const TYPE_LABELS = {
  meeting: 'Meeting',
  call: 'Call',
  email: 'Email',
  update: 'Update',
  document: 'Document',
  task: 'Task',
  note: 'Note',
  feedback: 'Feedback'
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <p className="text-sm text-ink/50 font-body py-4">
        No activity yet for this engagement.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-hairline">
      {activities.map((a) => (
        <li key={a.id} className="py-3 flex gap-4">
          <span className="font-mono text-xs text-ink/40 pt-1 w-20 flex-shrink-0">
            {formatDate(a.created_at)}
          </span>
          <div>
            <span className="inline-block text-[10px] uppercase tracking-wider text-brass font-mono mb-0.5">
              {TYPE_LABELS[a.type] || a.type}
            </span>
            <p className="font-body text-sm text-ink">{a.title}</p>
            {a.description && (
              <p className="font-body text-sm text-ink/60 mt-0.5">{a.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}