export const EGG_SIZES = [
  { id: "pewee",     name: "Pewee",      short: "PW" },
  { id: "piyok",     name: "Piyok",      short: "PK" },
  { id: "small",     name: "Small",      short: "SM" },
  { id: "medium",    name: "Medium",     short: "MD" },
  { id: "large",     name: "Large",      short: "LG" },
  { id: "xtralarge", name: "Xtra Large", short: "XL" },
  { id: "jumbo",     name: "Jumbo",      short: "JB" },
  { id: "xjumbo",    name: "X-Jumbo",    short: "XJ" },
];

export const EGGS_PER_TRAY = 30;
export const DISCREPANCY_THRESHOLD = 10;

export const ROLES = {
  ADMIN: "admin",
  TINDERO: "tindero",
};

// Fake domain for tindero usernames
// Tindero "juan" becomes "juan@sunshine.local" in Firebase Auth
// They never see this — they just type "juan"
export const TINDERO_DOMAIN = "@sunshine.local";

// Helper: Convert username to email format for Firebase Auth
export const usernameToEmail = (username) => {
  // If it already has @, it's a real email (admin)
  if (username.includes("@")) return username.toLowerCase().trim();
  // Otherwise, append the fake domain (tindero)
  return `${username.toLowerCase().trim()}${TINDERO_DOMAIN}`;
};