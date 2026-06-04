import React from 'react';
import { Plus, ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import './PocketsList.css';

const PocketsList = ({ pockets, onBack, onPocketClick, onCreatePocket, onEditPocket, onDeletePocket }) => {
  const handleEditClick = (e, pocket) => {
    e.stopPropagation();
    if (onEditPocket) {
      onEditPocket(pocket);
    }
  };

  const handleDeleteClick = (e, pocket) => {
    e.stopPropagation();
    if (onDeletePocket) {
      onDeletePocket(pocket);
    }
  };

  return (
    <div className="pockets-list-view">
      <div className="pl-header">
        <button className="pl-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Semua Kantong</h2>
        <div style={{ width: 24 }}></div> {/* spacer for centering */}
      </div>

      <div className="pl-content">
        <div className="pl-list">
          {pockets.map(pocket => (
            <div key={pocket.id} className={`pl-list-item ${pocket.colorClass}`} onClick={() => onPocketClick(pocket)}>
              <div className="pl-list-icon">
                <pocket.Icon size={20} />
              </div>
              <div className="pl-list-details">
                <div className="pl-list-header">
                  <h4>{pocket.title}</h4>
                  <p>{pocket.amount}</p>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${pocket.progress}%` }}></div>
                </div>
              </div>
              <div className="pl-list-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="pl-action-btn edit-btn" 
                  onClick={(e) => handleEditClick(e, pocket)}
                  title="Edit kantong"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="pl-action-btn delete-btn" 
                  onClick={(e) => handleDeleteClick(e, pocket)}
                  title="Hapus kantong"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <button className="pl-new-btn" onClick={onCreatePocket}>
            <div className="pl-new-icon">
              <Plus size={20} color="black" />
            </div>
            <span>Buat Kantong Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PocketsList;
