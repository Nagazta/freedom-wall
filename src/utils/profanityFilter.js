// Basic profanity and hate speech filter
// This is a simple implementation - for production, consider using a library like 'bad-words'

const bannedWords = [
  // English profanity
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'cunt',
  'dick', 'pussy', 'cock', 'whore', 'slut', 'motherfucker',

  // Hate / violence
  'nazi', 'hitler', 'genocide', 'terrorist',
  'kill yourself', 'kys', 'die', 'death to',
  'i hope you die', 'hate you',

  // Slurs (partial)
  'nigger', 'nigga', 'faggot', 'tranny',
  'retard', 'retarded',

  // Variations
  'f**k', 'sh*t', 'b*tch', 'a**hole', 'f*ck', 's**t',

  // Tagalog profanity / insults
  'putangina', 'puta', 'pota', 'punyeta', 'punyeta',
  'gago', 'tanga', 'bobo', 'ulol', 'tarantado',
  'hayop ka', 'leche', 'bwisit', 'bwiset',
  'kingina', 'kupal', 'kantot', 'jakol',
  'pokpok', 'malandi', 'sira ulo', 'walang utak',

  // Tagalog hate / harassment
  'mamatay ka', 'sana mamatay ka',
  'pakamatay ka', 'magpakamatay ka',
  'walang kwenta', 'basura ka',

  // Bisaya / Cebuano profanity
  'yawa', 'pisti', 'animal ka', 'buang',
  'atay', 'bilat', 'iyot', 'jakol',
  'pakyu', 'piste', 'amang', 'giatay',
  'bayot', 'bayut', 'iyut', 'jakul',

  // Bisaya insults / harassment
  'wala kay pulos', 'bogo', 'bogoa',
  'patay ka', 'mamatay ka',
  'pagpakamatay', 'pakamatay',
  'yati ka',

  // Mixed / slang spellings
  'potangina', 'putragis',
  'pucha', 'pucha naman',
  'pisti yawa'
];


const createPattern = (words) => {
  // Create regex pattern that matches words with common character substitutions
  const patterns = words.map(word => {
    const escaped = word
      .replace(/a/gi, '[a@4]')
      .replace(/e/gi, '[e3]')
      .replace(/i/gi, '[i1!]')
      .replace(/o/gi, '[o0]')
      .replace(/s/gi, '[s$5]')
      .replace(/t/gi, '[t7]')
      .replace(/\*/g, '.');
    return `\\b${escaped}\\b`;
  });

  return new RegExp(patterns.join('|'), 'gi');
};

const profanityPattern = createPattern(bannedWords);

export const containsProfanity = (text) => {
  if (!text) return false;
  return profanityPattern.test(text.toLowerCase());
};

export const getProfanityWarning = () => {
  return 'Your message contains inappropriate language. Please write kindly and respectfully.';
};
