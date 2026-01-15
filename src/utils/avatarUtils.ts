// Generate a random color based on participant id (for consistency)
export const generateAvatarColor = (id: number): string => {
  // Use a seeded random approach to get consistent colors per participant
  const colors = [
    '#ff6b6b', // Red
    '#4ecdc4', // Cyan
    '#45b7d1', // Blue
    '#96ceb4', // Green
    '#ffeaa7', // Yellow
    '#dda15e', // Orange
    '#9b59b6', // Purple
    '#e74c3c', // Dark Red
    '#3498db', // Bright Blue
    '#2ecc71', // Bright Green
    '#f39c12', // Gold
    '#e67e22', // Dark Orange
    '#1abc9c', // Turquoise
    '#34495e', // Dark Blue
    '#16a085', // Dark Green
    '#c0392b', // Dark Red
  ];
  return colors[id % colors.length];
};

// Generate a random uppercase letter based on participant id (for consistency)
export const generateAvatarLetter = (id: number, name: string): string => {
  // Try to get first letter from name
  const trimmedName = name.trim();
  if (trimmedName.length > 0) {
    // Get first character and convert to uppercase
    const firstChar = trimmedName.charAt(0).toUpperCase();
    // Check if it's a valid English letter
    if (firstChar >= 'A' && firstChar <= 'Z') {
      return firstChar;
    }
    // If it's a Chinese character or other, try to get a letter from the name
    // by finding the first English letter in the name
    for (let i = 0; i < trimmedName.length; i++) {
      const char = trimmedName.charAt(i).toUpperCase();
      if (char >= 'A' && char <= 'Z') {
        return char;
      }
    }
  }
  // Fallback to random letter based on id (ensures consistency)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[id % letters.length];
};


