import React from "react";
import "./Modal.css";

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
