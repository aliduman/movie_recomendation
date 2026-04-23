const BANNED = [
  'orospu', 'orospunun', 'orospu çocuğu', 'bok', 'boktan', 'göt', 'götü', 'götveren',
  'sik', 'siki', 'sikim', 'sikik', 'sikeyim', 'sikiş', 'sikişmek', 'sikerim',
  'amk', 'amına', 'amını', 'amcık', 'am', 'oç', 'oçlar',
  'piç', 'piçlik', 'piçler', 'piçin',
  'kahpe', 'kahpeler', 'kahpenin',
  'ibne', 'ibnelik', 'ibneler',
  'götveren', 'dağarcık', 'pezevenk', 'pezevenklik',
  'haysiyetsiz', 'bok', 'boktan', 'boku',
  'salak', 'aptal', 'gerizekalı', 'geri zekalı', 'mal', 'dangalak',
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt',
];

// Normalize: küçük harf, türkçe karakter normalize, boşlukları sıkıştır
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsProfanity(text) {
  const normalized = normalize(text);
  return BANNED.some((word) => {
    const normWord = normalize(word);
    const regex = new RegExp(`(^|\\s)${normWord}(\\s|$|[^a-z])`, 'i');
    return regex.test(normalized) || normalized.includes(normWord);
  });
}
