import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  backdrop = true,
  keyboard = true,
  className = ''
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (keyboard && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, keyboard]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (backdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'modal-sm';
      case 'large': return 'modal-lg';
      case 'extra-large': return 'modal-xl';
      default: return '';
    }
  };

  return (
    <div 
      className={`modal fade show ${className}`} 
      style={{ display: 'block' }}
      onClick={handleBackdropClick}
    >
      <div className={`modal-dialog ${getSizeClass()}`}>
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              {showCloseButton && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ModalHeader = ({ children, className = '' }) => (
  <div className={`modal-header ${className}`}>
    {children}
  </div>
);

export const ModalBody = ({ children, className = '' }) => (
  <div className={`modal-body ${className}`}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '' }) => (
  <div className={`modal-footer ${className}`}>
    {children}
  </div>
);

// Component con cho form modal
export const FormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  onSubmit,
  children,
  submitText = 'Lưu',
  cancelText = 'Hủy',
  isSubmitting = false,
  size = 'medium',
  submitVariant = 'primary'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {children}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className={`btn btn-${submitVariant}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : submitText}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// Component cho confirm modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <ModalBody>
        <p>{message}</p>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`btn btn-${variant}`}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default Modal;