import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import type { UserProfile } from '@/types';

interface NameEditModalProps {
  open: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSave: (name: string) => void;
}

const NameEditModal: React.FC<NameEditModalProps> = ({ open, onClose, userProfile, onSave }) => {
  const [nameDraft, setNameDraft] = useState(userProfile.name);

  useEffect(() => {
    if (open) setNameDraft(userProfile.name);
  }, [open, userProfile.name]);

  const handleSave = () => {
    onSave(nameDraft.trim() || 'کاربر گرامی');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-label="ویرایش نام">
      <h3 className="text-lg font-black text-slate-800 mb-4">نام شما</h3>
      <input
        type="text"
        value={nameDraft}
        onChange={(e) => setNameDraft(e.target.value)}
        placeholder="نام خود را وارد کنید"
        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium"
        dir="rtl"
        autoFocus
      />
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-colors"
        >
          ذخیره
        </button>
      </div>
    </Modal>
  );
};

export default NameEditModal;
