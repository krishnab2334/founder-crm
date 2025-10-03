import React, { useState, useContext } from 'react';
import Layout from '../components/Layout';
import { authAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiUserPlus, FiMail, FiCopy, FiKey } from 'react-icons/fi';

const TeamManagement = () => {
  const { user } = useContext(AuthContext);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Team Management</h1>
          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
            <FiUserPlus /> Invite Team Member
          </button>
        </div>

        <div className="team-info-card">
          <h3><FiKey /> Workspace Code</h3>
          <p>
            Share this code with team members so they can directly register and join your workspace:
          </p>
          <div className="workspace-code-container">
            <div className="workspace-code">
              <strong>Workspace ID:</strong> {user?.workspace_id}
            </div>
            <button onClick={() => copyToClipboard(user?.workspace_id?.toString())} className="btn btn-secondary">
              <FiCopy /> Copy Code
            </button>
          </div>
          <p className="note">
            Team members can use this code at <a href="/register-team-member" target="_blank">/register-team-member</a> to join directly
          </p>
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
              <button onClick={() => copyToClipboard(invitationLink)} className="btn btn-secondary">
                <FiCopy /> Copy
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
                    <FiMail /> Send Invitation
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
