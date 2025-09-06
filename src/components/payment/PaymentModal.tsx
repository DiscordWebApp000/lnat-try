'use client';

import { X, CreditCard } from 'lucide-react';
import IframePaymentForm from './IframePaymentForm';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: any;
}

export default function PaymentModal({ isOpen, onClose, selectedPlan }: PaymentModalProps) {
  if (!isOpen || !selectedPlan) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Payment</h3>
              <p className="text-sm text-gray-600">Selected plan: {selectedPlan.displayName || selectedPlan.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <IframePaymentForm selectedPlan={selectedPlan} />
        </div>
      </div>
    </div>
  );
}
