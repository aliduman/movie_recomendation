import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FiBell, FiClock, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useReminders } from '../hooks/useReminders';

function pad(n) {
  return String(n).padStart(2, '0');
}

function defaultDateTimeValue() {
  const now = new Date(Date.now() + 60 * 60 * 1000);
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function reminderToDate(reminder) {
  const due = reminder.dueAt;
  if (!due) return null;
  if (typeof due.toDate === 'function') return due.toDate();
  if (typeof due.seconds === 'number') return new Date(due.seconds * 1000);
  return new Date(due);
}

export default function RemindersModal({ watchlistId, watchlistName, onClose }) {
  const { t, i18n } = useTranslation();
  const { reminders, loading, createReminder, deleteReminder } = useReminders(watchlistId);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  ));
  const [dateValue, setDateValue] = useState(defaultDateTimeValue);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [minDateTime] = useState(defaultDateTimeValue);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (event) => setIsMobile(event.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language || 'tr', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [i18n.language],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createReminder({
        watchlistId,
        watchlistName,
        dueAt: new Date(dateValue),
        message,
      });
      toast.success(t('watchlist.reminderCreated'));
      setMessage('');
      setDateValue(defaultDateTimeValue());
    } catch (error) {
      if (error.message === 'REMINDER_INVALID_DATE') {
        toast.error(t('watchlist.reminderInvalidDate'));
      } else if (error.message === 'REMINDER_PAST') {
        toast.error(t('watchlist.reminderPast'));
      } else {
        toast.error(t('watchlist.reminderCreateFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reminderId) => {
    setDeletingId(reminderId);
    try {
      await deleteReminder(reminderId);
      toast.success(t('watchlist.reminderDeleted'));
    } catch (error) {
      console.error(error);
      toast.error(t('watchlist.reminderDeleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end sm:items-center sm:justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.94, y: 12 }}
          animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={(event) => event.stopPropagation()}
          className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-12 rounded-full bg-white/20" />
          </div>

          <div className="flex items-start gap-4 px-5 py-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <FiBell size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
                {t('watchlist.reminders')}
              </p>
              <h3 className="mt-1 text-lg font-bold line-clamp-1">{watchlistName}</h3>
              <p className="mt-1 text-sm text-gray-400">{t('watchlist.reminderSubtitle')}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <label className="block">
                <span className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                  {t('watchlist.reminderDateLabel')}
                </span>
                <input
                  type="datetime-local"
                  value={dateValue}
                  min={minDateTime}
                  onChange={(event) => setDateValue(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                  {t('watchlist.reminderMessageLabel')}
                </span>
                <input
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={t('watchlist.reminderMessagePlaceholder')}
                  maxLength={140}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-primary hover:bg-primary/80 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                <FiPlus size={16} />
                {submitting ? t('watchlist.creating') : t('watchlist.reminderSubmit')}
              </button>
            </form>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">
                {t('watchlist.reminderUpcoming')}
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : reminders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-center">
                  <div className="text-3xl mb-2">⏰</div>
                  <p className="text-sm text-gray-300">{t('watchlist.reminderEmpty')}</p>
                  <p className="mt-1 text-xs text-gray-500">{t('watchlist.reminderEmptyHint')}</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {reminders.map((reminder) => {
                    const due = reminderToDate(reminder);
                    const dueLabel = due ? formatter.format(due) : '';
                    const isDeleting = deletingId === reminder.id;
                    return (
                      <li
                        key={reminder.id}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                          <FiClock size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">{dueLabel}</p>
                          {reminder.message && (
                            <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                              {reminder.message}
                            </p>
                          )}
                          {reminder.fired && (
                            <span className="mt-1 inline-block text-[10px] uppercase tracking-wider text-emerald-300">
                              {t('watchlist.reminderFiredBadge')}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(reminder.id)}
                          disabled={isDeleting}
                          aria-label={t('watchlist.reminderDelete')}
                          className="p-2 rounded-full text-rose-300 hover:text-white hover:bg-rose-500/20 transition-colors disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <span className="block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <FiTrash2 size={14} />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
