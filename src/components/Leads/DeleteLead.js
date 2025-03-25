// DeleteLead.js
import React from 'react';
import axios from 'axios';

const DeleteLead = ({ leadId, onDeleteSuccess }) => {
  const handleDelete = async () => {
    try {
      // 1. Fetch the lead data before deletion
      const leadResponse = await axios.get(`http://localhost:5000/api/leads/${leadId}`);
      const leadData = leadResponse.data;

      // 2. Insert the lead data into leads_archive
      await axios.post('http://localhost:5000/api/leads-archive', leadData);

      // 3. Delete the lead from leads
      await axios.delete(`http://localhost:5000/api/leads/${leadId}`);

      // Notify the parent component of successful deletion
      if (onDeleteSuccess) {
        onDeleteSuccess(leadId); // Pass the deleted lead ID
      }
    } catch (error) {
      console.error('Error deleting and archiving lead:', error);
      // Handle the error (e.g., show a message to the user)
    }
  };

  return (
    <button onClick={handleDelete}>Delete</button>
  );
};

export default DeleteLead;