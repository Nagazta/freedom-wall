// Basic profanity and hate speech filter
// This is a simple implementation - for production, consider using a library like 'bad-words'

const bannedWords = [
  // Profanity
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'cunt',
  'dick', 'pussy', 'cock', 'whore', 'slut', 'motherfucker',

  // Hate speech keywords
  'nazi', 'hitler', 'genocide', 'terrorist', 'kill yourself',
  'kys', 'die', 'death to', 'hate you', 'i hope you die',

  // Slurs (partial list - add more as needed)
  'nigger', 'nigga', 'faggot', 'tranny', 'retard', 'retarded',

  // Common variations
  'f**k', 'sh*t', 'b*tch', 'a**hole', 'f*ck', 's**t'
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
