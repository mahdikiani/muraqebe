import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';

const CUSTOM_ICONS = [
  '📌', '📿', '📖', '🕌', '🪙', '🤲', '⚖️', '📜', '🌙', '✨', '🤝', '💧', '🛐', '🗞️', '☀️', '🔖', '📝', '⏰', '🧘', '🎯', '❤️', '📚', '🕯️', '🌙',
];

interface AddCustomTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, url: string, icon: string) => void;
}

const AddCustomTaskModal: React.FC<AddCustomTaskModalProps> = ({ open, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('📌');

  const handleAdd = () => {
    const t = title.trim();
    if (!t) return;
    onAdd(t, description, url, icon);
    setTitle('');
    setDescription('');
    setUrl('');
    setIcon('📌');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setIcon('📌');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} aria-label="افزودن مورد روزانهٔ شخصی">
      <h3 className="text-lg font-black text-slate-800 mb-4">افزودن مورد روزانهٔ شخصی</h3>
      <label className="block text-xs font-bold text-slate-500 mb-2">عنوان (الزامی)</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="مثلاً: مطالعهٔ یک صفحه کتاب"
        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium mb-4"
        dir="rtl"
        autoFocus
      />
      <label className="block text-xs font-bold text-slate-500 mb-2">توضیح (اختیاری)</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="توضیح کوتاه"
        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium mb-4"
        dir="rtl"
      />
      <label className="block text-xs font-bold text-slate-500 mb-2">لینک (اختیاری)</label>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium mb-4"
        dir="ltr"
      />
      <label className="block text-xs font-bold text-slate-500 mb-2">آیکون</label>
      <div className="flex flex-wrap gap-2 mb-6">
        {CUSTOM_ICONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setIcon(emoji)}
            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${icon === emoji ? 'bg-emerald-100 ring-2 ring-emerald-400 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}
            title={emoji}
            aria-label={`آیکون ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-colors"
        >
          ذخیره
        </button>
      </div>
    </Modal>
  );
};

export default AddCustomTaskModal;
