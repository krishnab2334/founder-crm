import React, { useState } from 'react';
import Layout from '../components/Layout';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
// Using simple icons

const TeamManagement = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'team_member'
  });
  const [invitationLink, setInvitationLink] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await authAPI.inviteTeamMember(formData);
      toast.success('Invitation sent successfully!');
      setInvitationLink(response.data.data.invitationLink);
      setFormData({ email: '', role: 'team_member' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    toast.success('Link copied to clipboard!');
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Team Management</h1>
          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
            <span>👥</span> Invite Team Member
          </button>
        </div>

        <div className="team-info-card">
          <h3>Invite Team Members</h3>
          <p>
            As a founder, you can invite team members to your workspace. They will receive an email 
            with an invitation link to join your workspace.
          </p>
          <p>
            Team members will have access to:
          </p>
          <ul>
            <li>View and manage contacts</li>
            <li>Create and complete tasks</li>
            <li>Track deals in the pipeline</li>
            <li>Add interactions with contacts</li>
            <li>Access AI-powered features</li>
          </ul>
        </div>

        {invitationLink && (
          <div className="invitation-result">
            <h3>✅ Invitation Created!</h3>
            <p>Share this link with your team member:</p>
            <div className="link-container">
              <input 
                type="text" 
                value={invitationLink} 
                readOnly 
                onClick={(e) => e.target.select()}
              />
              <button onClick={copyToClipboard} className="btn btn-secondary">
                <span>📋</span> Copy
              </button>
            </div>
            <p className="note">This link will expire in 7 days</p>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Invite Team Member</h2>
                <button onClick={() => setShowInviteModal(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="teammate@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="team_member">Team Member</option>
                    <option value="founder">Founder</option>
                  </select>
                  <small>Founders have full access including team management</small>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <span>📧</span> Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeamManagement;
