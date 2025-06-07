import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  // Optional: close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center  z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-accent-color p-3 rounded-lg w-[75vw] max-w-md h-[65vh] overflow-auto shadow-2xl">
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
