// src/components/AdminDashboard.jsx
// Using bootstrap for styling 
// import react module & useState hook which add state variable to component 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';

// Array of object of  laborers with id,name,specialization,status
const Laborers = [
  { id: 1, name: 'Ravi Singh', specialization: 'Plumber', status: 'Pending' },
  { id: 2, name: 'Geeta Meena', specialization: 'Electrician', status: 'Approved' },
  { id: 3, name: 'Anil Kumar', specialization: 'Mason', status: 'Pending' },
];

// Array of object of log entries with id,type of interaction,name,content of purpose
const Logs = [
  { id: 1, type: 'Message', user: 'User1', laborer: 'Ravi Singh', content: 'Looking for pipe repair.' },
  { id: 2, type: 'Call', user: 'User2', laborer: 'Geeta Meena', content: 'Call placed for wiring issue.' },
];

//Admin Dashboard JS arrow function 
const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Restrict to admin only
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      showToast('Access denied: Admins only', 'danger');
      navigate('/login');
    }
  }, [user, navigate, showToast]);

  // Fetch job applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url = '/applications';
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (params.length) url += '?' + params.join('&');
      const res = await axiosInstance.get(url);
      setApplications(res.data);
    } catch {
      showToast('Failed to fetch applications', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, [statusFilter, search]);

  // Approve/reject application
  const handleStatusChange = async (id, action) => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/applications/${id}/${action}`);
      showToast(`Application ${action}d`, 'success');
      fetchApplications();
    } catch {
      showToast(`Failed to ${action} application`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    // py-4 = 1.5rem/24px p-padding,m-margin bootstrap, using className instead of class since class is keyword in js
    <div className="container py-4">  
      <h2>Admin Dashboard</h2>

      {/* Section 1: Laborer Approvals */}
      <div className="my-4">
        <h4>Job Applications</h4>
        <div className="d-flex gap-2 mb-3">
          <select className="form-select w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Search by job or applicant"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 220 }}
          />
          <button className="btn btn-outline-secondary" onClick={fetchApplications} disabled={loading}>Refresh</button>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Job</th>
              <th>Applicant</th>
              <th>Message</th>
              <th>Status</th>
              <th>Applied At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr><td colSpan={6} className="text-center">No applications found.</td></tr>
            )}
            {applications.map(app => (
              <tr key={app._id}>
                <td>{app.jobId?.title || '-'}</td>
                <td>{app.applicantId?.name || '-'}</td>
                <td>{app.message || '-'}</td>
                <td>
                  <span className={`badge bg-${app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning text-dark'}`}>{app.status}</span>
                </td>
                <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleString() : '-'}</td>
                <td>
                  {app.status === 'pending' && (
                    <>
                      <button className="btn btn-sm btn-success me-2" onClick={() => handleStatusChange(app._id, 'approve')} disabled={loading}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(app._id, 'reject')} disabled={loading}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* {Section 2: Chat & Call Logs} {Strong tag used to display text with strong importance} */}
      <div className="my-4">
        <h4>Chat & Call Logs</h4>
        <ul className="list-group">
          {Logs.map((log) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={log.id}>
              <div>
                <strong>{log.type}</strong> - {log.user} ➝ {log.laborer}: {log.content}
              </div>
              <span className="badge bg-secondary">{log.type}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
