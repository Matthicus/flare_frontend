import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="relative bg-accent-color p-3 rounded-lg w-[75vw] max-w-md h-[65vh] overflow-auto shadow-2xl">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-5 text-white text-3xl hover:text-red-400"
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
