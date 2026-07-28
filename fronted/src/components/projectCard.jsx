import MilestoneStepper from './MilestoneStepper';
import ActivityFeed from './ActivityFeed';

const SERVICE_LABELS = {
  social_media_management: 'Social Media Management',
  operational_improvement: 'Operational Structural Improvement',
  branding_coaching: 'Branding & Coaching',
  sponsorship_partnership: 'Sponsorship & Partnership',
  website_development: 'Website Development',
  ongoing_consulting: 'Ongoing Consulting'
};

const STATUS_STYLES = {
  active: 'bg-sage/10 text-sage border-sage/30',
  planning: 'bg-brass/10 text-brass border-brass/30',
  on_hold: 'bg-ink/5 text-ink/50 border-hairline',
  completed: 'bg-ink/5 text-ink/40 border-hairline'
};

export default function ProjectCard({ project }) {
  const isOngoing = project.progress_mode === 'ongoing';

  return (
    <div className="bg-white border border-hairline rounded-sm p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-xl text-ink">{project.name}</h3>
          <p className="font-body text-sm text-ink/50 mt-0.5">
            {SERVICE_LABELS[project.service_type] || project.service_type}
            {project.account_manager && ` · Led by ${project.account_manager}`}
          </p>
        </div>
        <span
          className={`font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 border rounded-sm ${STATUS_STYLES[project.status]}`}
        >
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {isOngoing ? (
        <div className="bg-paper border border-hairline rounded-sm px-4 py-3 mb-5">
          <p className="font-mono text-xs text-ink/50 uppercase tracking-wider">
            Ongoing Engagement — Current Cycle
          </p>
          <p className="font-body text-sm text-ink/70 mt-1">
            Tracked via recurring activity below, rather than fixed milestones.
          </p>
        </div>
      ) : (
        <div className="mb-5">
          <MilestoneStepper milestones={project.milestones} />
        </div>
      )}
<div className="mb-5">
        <p className="font-mono text-xs uppercase tracking-wider text-ink/40 mb-1">
          Recent Activity
        </p>
        <ActivityFeed activities={project.recentActivity} />
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-ink/40 mb-1">
          Documents
        </p>
        {project.documents && project.documents.length > 0 ? (
          <ul className="divide-y divide-hairline">
            {project.documents.map((d) => (
              <li key={d.id} className="py-2 flex items-center justify-between">
                <span className="font-body text-sm text-ink">{d.file_name}</span>
                <a
                  href={`http://localhost:5000/api/documents/${d.id}/download`}
                  className="font-mono text-xs uppercase tracking-wider text-brass hover:underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/50 font-body py-2">No documents shared yet.</p>
        )}
      </div>
    </div>
  );
}
    