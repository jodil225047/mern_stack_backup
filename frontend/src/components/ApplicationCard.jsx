import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MoreHorizontal, Trash2, Pencil, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { applicationsApi, errorMessage } from '../services/api.js';
const money = value => value == null || value === '' ? null : new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
export default function ApplicationCard({ application:a, onChanged, onEdit, onDelete }) {
 const navigate=useNavigate(); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 const date=new Date(a.appliedDate).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
 return <article className="application-row"><div className="company-cell"><div className="company-avatar">{(a.company||'?').trim().charAt(0).toUpperCase()}</div><div className="company-meta"><button className="company-name" onClick={()=>navigate(`/applications/${encodeURIComponent(a.applicationId)}`)}>{a.company}<ArrowUpRight size={13}/></button><span>{a.applicationId}</span></div></div><div className="role-cell"><strong>{a.role}</strong><span>{a.jobType}</span></div><div className="date-cell"><CalendarDays size={14}/>{date}</div><div className="status-cell"><StatusBadge status={a.status} overdue={a.isOverdue}/></div><div className="row-actions"><button className="icon-button" aria-label={`View ${a.company}`} onClick={()=>navigate(`/applications/${encodeURIComponent(a.applicationId)}`)}><Eye size={16}/></button><button className="icon-button" aria-label={`Edit ${a.company}`} onClick={()=>onEdit(a)}><Pencil size={16}/></button><button className="icon-button danger-icon" aria-label={`Delete ${a.company}`} title={['Interview','Offer'].includes(a.status)?`Cannot delete while status is ${a.status}`:'Delete application'} disabled={['Interview','Offer'].includes(a.status)} onClick={()=>onDelete(a)}><Trash2 size={16}/></button></div>{error&&<div className="inline-error">{errorMessage(error)}</div>}</article>;
}
