import { motion } from 'framer-motion';

const MyFlickPickLogo = ({ variant = 'horizontal', className = '', width, height }) => {
  const iconOnly = variant === 'icon';

  const defaultWidth = iconOnly ? 48 : 200;
  const defaultHeight = iconOnly ? 48 : 48;

  const finalWidth = width || defaultWidth;
  const finalHeight = height || defaultHeight;

  if (iconOnly) {
    return (
      <motion.svg
        width={finalWidth}
        height={finalHeight}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.12 }}
      >
        <defs>
          <linearGradient id="gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#C026D3" />
          </linearGradient>
        </defs>

        <rect x="6" y="10" width="36" height="28" rx="3" fill="url(#gradient-icon)" />

        <rect x="8" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.3" />
        <rect x="8" y="20" width="3" height="3" rx="0.5" fill="white" opacity="0.3" />
        <rect x="8" y="28" width="3" height="3" rx="0.5" fill="white" opacity="0.3" />
        <rect x="37" y="12" width="3" height="3" rx="0.5" fill="white" opacity="0.3" />
        <rect x="37" y="20" width="3" height="3" rx="0.5" fill="white" opacity="0.3" />
        <rect x="37" y="28" width="3" height="3" rx="0.5" fill="white" opacity="0.3" />

        {/* Klapör kapağı — açık konumdan kapanıyor */}
        <motion.g
          style={{ originX: '6px', originY: '16px' }}
          initial={{ rotate: -40 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }}
        >
          <path
            d="M6 13C6 11.3431 7.34315 10 9 10H39C40.6569 10 42 11.3431 42 13V16H6V13Z"
            fill="white"
            opacity="0.9"
          />
          <rect x="10" y="10" width="4" height="6" fill="#7C3AED" />
          <rect x="18" y="10" width="4" height="6" fill="#7C3AED" />
          <rect x="26" y="10" width="4" height="6" fill="#7C3AED" />
          <rect x="34" y="10" width="4" height="6" fill="#7C3AED" />
        </motion.g>

        {/* İmleç/Pick — sürekli hafif sallanma */}
        <motion.g
          animate={{ y: [0, -2.5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <path
            d="M28 22L32 26L30 28L34 32L32 34L28 30L26 32L28 22Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M28 22L32 26L30 28L34 32L32 34L28 30L26 32L28 22Z"
            stroke="#7C3AED"
            strokeWidth="0.5"
          />
        </motion.g>
      </motion.svg>
    );
  }

  return (
    <motion.svg
      width={finalWidth}
      height={finalHeight}
      viewBox="0 0 200 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ scale: 1.04 }}
    >
      <defs>
        <linearGradient id="gradient-horizontal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
      </defs>

      {/* Film kutusu arka planı */}
      <rect x="2" y="8" width="32" height="32" rx="3" fill="url(#gradient-horizontal)" />

      {/* Yan delikler */}
      <rect x="4" y="10" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.3" />
      <rect x="4" y="17" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.3" />
      <rect x="4" y="24" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.3" />
      <rect x="4" y="31" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.3" />
      <rect x="29.5" y="10" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.3" />
      <rect x="29.5" y="17" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.3" />
      <rect x="29.5" y="24" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.3" />
      <rect x="29.5" y="31" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.3" />

      {/* Klapör kapağı — açık konumdan kapanıyor */}
      <motion.g
        style={{ originX: '2px', originY: '14px' }}
        initial={{ rotate: -40 }}
        animate={{ rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 18 }}
      >
        <path
          d="M2 11C2 9.34315 3.34315 8 5 8H31C32.6569 8 34 9.34315 34 11V14H2V11Z"
          fill="white"
          opacity="0.9"
        />
        <rect x="6" y="8" width="3" height="6" fill="#7C3AED" />
        <rect x="12" y="8" width="3" height="6" fill="#7C3AED" />
        <rect x="18" y="8" width="3" height="6" fill="#7C3AED" />
        <rect x="24" y="8" width="3" height="6" fill="#7C3AED" />
      </motion.g>

      {/* İmleç/Pick — sürekli hafif sallanma */}
      <motion.g
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      >
        <path
          d="M20 20L24 24L22.5 25.5L26 29L24.5 30.5L21 27L19.5 28.5L20 20Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M20 20L24 24L22.5 25.5L26 29L24.5 30.5L21 27L19.5 28.5L20 20Z"
          stroke="#7C3AED"
          strokeWidth="0.5"
        />
      </motion.g>

      {/* Wordmark — soldan kayarak giriş */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
      >
        <text
          x="42"
          y="30"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="20"
          fontWeight="300"
          fill="white"
          opacity="0.9"
        >
          My
        </text>
        <text
          x="66"
          y="30"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="20"
          fontWeight="700"
          fill="url(#gradient-horizontal)"
        >
          FlickPick
        </text>
      </motion.g>
    </motion.svg>
  );
};

export default MyFlickPickLogo;
