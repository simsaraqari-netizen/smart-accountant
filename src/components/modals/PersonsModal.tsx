import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  X, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { Timestamp, collection, addDoc } from 'firebase/firestore';

interface PersonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  persons: any[];
  tenantId: string;
  db: any;
  pushToHistory: (action: any) => void;
  editingPerson: any | null;
  setEditingPerson: (person: any | null) => void;
  confirmDelete: any | null;
  setConfirmDelete: (person: any | null) => void;
  onDeletePerson: (person: any) => void;
  onEditPerson: (person: any, newName: string) => void;
}

export const PersonsModal = ({
  isOpen,
  onClose,
  persons,
  tenantId,
  db,
  pushToHistory,
  editingPerson,
  setEditingPerson,
  confirmDelete,
  setConfirmDelete,
  onDeletePerson,
  onEditPerson
}: PersonsModalProps) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full h-full shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="w-10"></div>
                <h3 className="text-lg font-black text-blue-600">إدارة الأشخاص</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="اسم الشخص الجديد"
                    className="flex-grow bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-right focus:border-blue-500 transition-all outline-none"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        const name = e.currentTarget.value;
                        const input = e.currentTarget;
                        input.value = '';
                        try {
                          const personData = {
                            name,
                            userId: tenantId,
                            createdAt: Timestamp.now()
                          };
                          const docRef = await addDoc(collection(db, 'persons'), personData);
                          pushToHistory({
                            type: 'ADD',
                            collection: 'persons',
                            id: docRef.id,
                            data: personData
                          });
                        } catch (err) {
                          console.error('Error adding person:', err);
                          input.value = name;
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={async (e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value) {
                        const name = input.value;
                        input.value = '';
                        try {
                          const personData = {
                            name,
                            userId: tenantId,
                            createdAt: Timestamp.now()
                          };
                          const docRef = await addDoc(collection(db, 'persons'), personData);
                          pushToHistory({
                            type: 'ADD',
                            collection: 'persons',
                            id: docRef.id,
                            data: personData
                          });
                        } catch (err) {
                          console.error('Error adding person:', err);
                          input.value = name;
                        }
                      }
                    }}
                    className="bg-blue-600 text-white px-4 rounded-xl font-black text-sm hover:bg-blue-700"
                  >
                    إضافة
                  </button>
                </div>

                <div className="space-y-2">
                  {persons.map(person => (
                    <div key={person.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                      {editingPerson?.id === person.id ? (
                        <div className="flex gap-2 flex-grow">
                          <input 
                            type="text"
                            defaultValue={person.name}
                            className="flex-grow bg-white border-2 border-blue-200 rounded-lg p-2 text-sm font-bold text-right outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onEditPerson(person, e.currentTarget.value);
                              }
                            }}
                          />
                          <button 
                            onClick={() => setEditingPerson(null)}
                            className="text-gray-500 hover:bg-gray-200 p-2 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-sm text-gray-700">{person.name}</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => setEditingPerson(person)}
                              className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setConfirmDelete(person)}
                              className="text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-black text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من حذف {confirmDelete.name}؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 rounded-xl font-bold text-sm bg-gray-100 text-gray-700"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => onDeletePerson(confirmDelete)}
                  className="flex-1 py-2 rounded-xl font-bold text-sm bg-rose-600 text-white"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
