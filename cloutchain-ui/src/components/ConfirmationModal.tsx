import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
          border: 'border-yellow-200'
        };
      default:
        return {
          icon: 'text-blue-500',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
          border: 'border-blue-200'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${colors.iconBg}`}>
              {type === 'danger' ? (
                <Trash2 size={20} className={colors.icon} />
              ) : (
                <AlertTriangle size={20} className={colors.icon} />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 ${colors.confirmBtn} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}