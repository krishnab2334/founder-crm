import React from 'react';
import { Link } from 'react-router-dom';
import './DealCard.css'; // You'll need to create this CSS file

const DealCard = ({ deal }) => {
  if (!deal) {
    return null;
  }

  // Helper function to get a color for the stage (e.g., for a badge)
  const getStageColor = (stage) => {
    switch (stage) {
      case 'lead':
        return 'var(--color-blue)';
      case 'prospect':
        return 'var(--color-orange)';
      case 'proposal':
        return 'var(--color-purple)';
      case 'negotiation':
        return 'var(--color-green)';
      case 'won':
        return 'var(--color-success)';
      case 'lost':
        return 'var(--color-danger)';
      default:
        return 'var(--color-gray)';
    }
  };

  return (
    <div className="deal-card">
      <Link to={`/deals/${deal.id}`}>
        <div className="deal-header">
          <span 
            className="deal-stage-badge" 
            style={{ backgroundColor: getStageColor(deal.stage) }}
          >
            {deal.stage}
          </span>
          <p className="deal-amount">${deal.amount?.toLocaleString()}</p>
        </div>
        <h3>{deal.name}</h3>
        <p className="deal-contact">{deal.contact_name}</p>
        <div className="deal-footer">
          <span className="deal-date">{new Date(deal.created_at).toLocaleDateString()}</span>
        </div>
      </Link>
    </div>
  );
};

export default DealCard;