import React, { useState, useEffect } from 'react';

interface Props {
  visible: boolean;
  name: string;
  email: string;
  onCancel: () => void;
  onSubmit: (name: string, email: string) => void;
}

const ProfileModal: React.FC<Props> = ({ visible, name, email, onCancel, onSubmit }) => {
  const [n, setN] = useState(name);
  const [e, setE] = useState(email);

  useEffect(() => {
    if (visible) {
      setN(name);
      setE(email);
    }
  }, [visible, name, email]);

  if (!visible) return null;

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    onSubmit(n, e);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Редактировать профиль</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Имя</label>
            <input
              type="text"
              value={n}
              onChange={e => setN(e.target.value)}
              className="mt-1 w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={e}
              onChange={e => setE(e.target.value)}
              className="mt-1 w-full border rounded p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white border rounded"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;