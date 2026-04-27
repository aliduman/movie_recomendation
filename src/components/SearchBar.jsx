import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative max-w-md mx-auto"
    >
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('explore.searchPlaceholder')}
        className="w-full pl-11 pr-10 py-3 rounded-xl bg-dark border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all placeholder-gray-500"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        >
          <FiX size={16} />
        </button>
      )}
    </motion.form>
  );
}
