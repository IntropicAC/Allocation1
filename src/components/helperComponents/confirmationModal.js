import React, { useState } from 'react';

const ConfirmationModal = ({ question, onConfirm, onCancel }) => {
  const [showModal, setShowModal] = useState(true);

  const handleConfirm = () => {
    onConfirm();
    setShowModal(false);
  };

  const handleCancel = () => {
    onCancel();
    setShowModal(false);
  };

  return showModal ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '5px',
        }}
      >
        <h3>{question}</h3>
        <div>
          <button onClick={handleConfirm}>Yes</button>
          <button onClick={handleCancel}>No</button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ConfirmationModal;