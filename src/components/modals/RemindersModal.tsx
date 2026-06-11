import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Bell, Plus, Trash2, Calendar, Clock, RefreshCw, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Reminder } from '../../types';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  tenantId: string;
  userId: string;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({ isOpen, onClose, reminders, tenantId, userId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !dueTime) return;

    try {
      const dateTimeString = `${dueDate}T${dueTime}`;
      const dateObj = new Date(dateTimeString);

      await addDoc(collection(db, 'reminders'), {
        title,
        description,
        dueDate: Timestamp.fromDate(dateObj),
        isRecurring,
        frequency: isRecurring ? frequency : null,
        userId,
        tenantId,
        enabled: true
      });

      setShowAddForm(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setDueTime('');
      setIsRecurring(false);
    } catch (error) {
      console.error("Error adding reminder", error);
      alert('حدث خطأ أثناء إضافة التذكير');
    }
  };

  const toggleStatus = async (reminder: Reminder) => {
    await updateDoc(doc(db, 'reminders', reminder.id), {
      enabled: !reminder.enabled
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التذكير؟')) {
      await deleteDoc(doc(db, 'reminders', id));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-[var(--color-ios-background)] w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="ios-glass p-4 border-b border-white/20 flex justify-between items-center sticky top-0 z-10">
              <div className="w-10"></div>
              <h3 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                <Bell className="w-5 h-5" /> التذكيرات
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors active:scale-90">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {!showAddForm ? (
                <>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="w-full mb-6 bg-white border-2 border-emerald-100 text-emerald-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-5 h-5" /> إضافة تذكير جديد
                  </button>

                  <div className="space-y-3">
                    {reminders.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-bold">لا توجد تذكيرات حالياً</p>
                      </div>
                    ) : (
                      reminders.map(reminder => {
                        const dateObj = reminder.dueDate.toDate();
                        const isPast = dateObj < new Date() && reminder.enabled;

                        return (
                          <div key={reminder.id} className={`bg-white p-4 rounded-2xl shadow-sm border-2 transition-all ${isPast ? 'border-rose-200 bg-rose-50/30' : 'border-transparent'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-black text-gray-900 text-base">{reminder.title}</h4>
                                {reminder.description && <p className="text-xs font-bold text-gray-500 mt-1">{reminder.description}</p>}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleStatus(reminder)}
                                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${reminder.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                                >
                                  {reminder.enabled ? 'مفعل' : 'معطل'}
                                </button>
                                <button
                                  onClick={() => handleDelete(reminder.id)}
                                  className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-500 bg-gray-50 p-2 rounded-xl">
                              <span className={`flex items-center gap-1 ${isPast ? 'text-rose-600' : ''}`}>
                                <Calendar className="w-3.5 h-3.5" /> 
                                {format(dateObj, 'd/M/yyyy', { locale: ar })}
                              </span>
                              <span className={`flex items-center gap-1 ${isPast ? 'text-rose-600' : ''}`}>
                                <Clock className="w-3.5 h-3.5" /> 
                                {format(dateObj, 'hh:mm a', { locale: ar })}
                              </span>
                              {reminder.isRecurring && (
                                <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                                  <RefreshCw className="w-3 h-3" /> 
                                  {reminder.frequency === 'daily' ? 'يومياً' : reminder.frequency === 'weekly' ? 'أسبوعياً' : reminder.frequency === 'monthly' ? 'شهرياً' : 'سنوياً'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <motion.form 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleAdd} 
                  className="bg-white p-5 rounded-2xl shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-black text-gray-900 text-sm">تذكير جديد</h4>
                    <button type="button" onClick={() => setShowAddForm(false)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">عنوان التذكير</label>
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="مثال: دفع الإيجار"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الوصف (اختياري)</label>
                    <textarea 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all min-h-[80px]"
                      placeholder="تفاصيل إضافية..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">التاريخ</label>
                      <input 
                        type="date" 
                        required
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الوقت</label>
                      <input 
                        type="time" 
                        required
                        value={dueTime}
                        onChange={e => setDueTime(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input 
                        type="checkbox" 
                        checked={isRecurring}
                        onChange={e => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-gray-700">تكرار التذكير</span>
                    </label>

                    <AnimatePresence>
                      {isRecurring && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                        >
                          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(freq => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setFrequency(freq)}
                              className={`py-2 rounded-xl text-xs font-bold transition-all ${frequency === freq ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500' : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'}`}
                            >
                              {freq === 'daily' ? 'يومياً' : freq === 'weekly' ? 'أسبوعياً' : freq === 'monthly' ? 'شهرياً' : 'سنوياً'}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-black text-sm hover:bg-gray-800 transition-all flex justify-center items-center gap-2 mt-4"
                  >
                    <Check className="w-5 h-5" /> حفظ التذكير
                  </button>
                </motion.form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
