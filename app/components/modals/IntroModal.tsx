import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';

interface IntroModalProps {
  open: boolean;
  onClose: () => void;
}

const IntroModal: React.FC<IntroModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      aria-label="خوش آمدید"
      overlayClassName="bg-emerald-950/40"
      className="p-8"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
          <InformationCircleIcon className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800">خوش آمدید</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            تمامی اطلاعات شما از جمله پیشرفت روزانه و تنظیمات،{' '}
            <span className="text-emerald-600 font-bold underline">فقط روی همین دستگاه</span> ذخیره می‌شود و به هیچ
            سروری ارسال نخواهد شد.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
        >
          متوجه شدم
        </button>
      </div>
    </Modal>
  );
};

export default IntroModal;
