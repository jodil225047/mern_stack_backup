const classes={Applied:'applied',Interview:'interview',Offer:'offer',Accepted:'accepted',Rejected:'rejected',Declined:'declined'};
export default function StatusBadge({ status, overdue=false }) { if(overdue) return <span className="status-badge overdue"><i/> Follow-up Overdue</span>; return <span className={`status-badge ${classes[status]||'applied'}`}><i/>{status}</span>; }
