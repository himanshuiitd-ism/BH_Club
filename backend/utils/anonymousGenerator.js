// utils/anonymousGenerator.js

const adjectives = [
  "Mysterious",
  "Curious",
  "Sneaky",
  "Whispering",
  "Silent",
  "Hidden",
  "Secret",
  "Shadow",
  "Midnight",
  "Cosmic",
  "Electric",
  "Neon",
  "Digital",
  "Phantom",
  "Mystic",
  "Enigmatic",
  "Stealthy",
  "Invisible",
  "Anonymous",
  "Unknown",
  "Wandering",
  "Lost",
  "Confused",
  "Wise",
  "Clever",
  "Funny",
  "Witty",
  "Sassy",
  "Bold",
  "Shy",
  "Quiet",
  "Loud",
  "Crazy",
  "Chill",
  "Cool",
];

const nouns = [
  "Cat",
  "Fox",
  "Wolf",
  "Owl",
  "Raven",
  "Tiger",
  "Lion",
  "Bear",
  "Eagle",
  "Dolphin",
  "Whale",
  "Shark",
  "Butterfly",
  "Dragon",
  "Phoenix",
  "Unicorn",
  "Ghost",
  "Spirit",
  "Angel",
  "Demon",
  "Ninja",
  "Warrior",
  "Knight",
  "Wizard",
  "Hacker",
  "Coder",
  "Gamer",
  "Artist",
  "Dreamer",
  "Thinker",
  "Wanderer",
  "Explorer",
  "Adventurer",
  "Rebel",
  "Hero",
  "Villain",
  "Joker",
  "Clown",
];

const avatarColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D7BDE2",
  "#A3E4D7",
  "#F9E79F",
  "#D5A6BD",
];

const avatarIcons = [
  "🎭",
  "👤",
  "🎪",
  "🎨",
  "🎯",
  "🎲",
  "🎸",
  "🎹",
  "🎺",
  "🎷",
  "🌟",
  "⭐",
  "✨",
  "🔥",
  "💫",
  "🌙",
  "☀️",
  "🌈",
  "⚡",
  "💎",
  "🦄",
  "🐺",
  "🦊",
  "🐱",
  "🐭",
  "🐰",
  "🐼",
  "🐻",
  "🦁",
  "🐯",
];

export const generateAnonymousIdentity = () => {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 999) + 1; // 1-999

  const anonymousName = `${randomAdjective} ${randomNoun}${randomNumber}`;

  const avatarColor =
    avatarColors[Math.floor(Math.random() * avatarColors.length)];
  const avatarIcon =
    avatarIcons[Math.floor(Math.random() * avatarIcons.length)];

  const anonymousAvatar = JSON.stringify({
    backgroundColor: avatarColor,
    icon: avatarIcon,
    textColor: "#FFFFFF",
  });

  return {
    anonymousName,
    anonymousAvatar,
  };
};

export const parseAvatar = (avatarString) => {
  try {
    return JSON.parse(avatarString);
  } catch (error) {
    // Fallback avatar
    return {
      backgroundColor: "#4ECDC4",
      icon: "👤",
      textColor: "#FFFFFF",
    };
  }
};

// Function to check if user needs a new anonymous identity (session expired)
export const needsNewIdentity = (lastSession) => {
  if (!lastSession) return true;

  const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
  const now = new Date();
  const sessionStart = new Date(lastSession.sessionStart);

  return now - sessionStart > sessionDuration;
};
