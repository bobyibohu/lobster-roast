'use client';

import { useState } from 'react';
import CreateComplaintModal from './CreateComplaintModal';

interface Props {
  onSuccess?: () => void;
}

export default function FloatingButton({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#ff6b4a] rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#ff5722] transition-all active:scale-95 z-40"
      >
        +
      </button>

      <CreateComplaintModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}
