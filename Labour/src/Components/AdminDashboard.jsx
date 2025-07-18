// src/components/AdminDashboard.jsx
// Using bootstrap for styling 
// import react module & useState hook which add state variable to component 
import React, { useState } from 'react';

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
  // useState for laborers
  const [laborers, setLaborers] = useState(Laborers);
  
  //JS arrow function to Approve laborers by getting their id 
  const handleApprove = (id) => {
    // 1. Map through the `laborers` array
    const updated = laborers.map((lab) =>
      // 2. If the laborer's ID matches the provided `id`, update their status
      lab.id === id ? { ...lab, status: 'Approved' } : lab
    );
     // 3. Update the state with the new array
    setLaborers(updated);
  };
  
   //JS arrow function to delete laborers by getting their id 
  const handleDelete = (id) => {
    // 1. Filter through the `laborers` array,if the laborer's ID doesn't matches the provided `id`
    const updated = laborers.filter((lab) => lab.id !== id);
    // 2. Update the state with the new array
    setLaborers(updated);
  };
  
  return (
    // py-4 = 1.5rem/24px p-padding,m-margin bootstrap, using className instead of class since class is keyword in js
    <div className="container py-4">  
      <h2>Admin Dashboard</h2>

      {/* Section 1: Laborer Approvals */}
      <div className="my-4">
        <h4>Laborer Approvals</h4>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {laborers.map((lab) => (
              <tr key={lab.id}>
                <td>{lab.name}</td>
                <td>{lab.specialization}</td>
                <td>
                  <span
                    className={`badge ${
                      lab.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'
                    }`}
                  >
                    {lab.status}
                  </span>
                </td>
                <td>
                  {lab.status === 'Pending' && (
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => handleApprove(lab.id)}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(lab.id)}
                  >
                    Delete
                  </button>
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
