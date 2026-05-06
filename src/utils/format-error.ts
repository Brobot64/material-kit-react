const PATTERNS: Array<[RegExp, string]> = [
  [/E11000 duplicate key|duplicate key error/i, 'A record with this information already exists.'],
  [/cast to objectid failed|invalid objectid|objectid failed/i, 'Invalid ID provided.'],
  [/is required|path .* is required|field .* required/i, 'Please fill in all required fields.'],
  [/jwt expired|token expired|session expired/i, 'Your session has expired. Please sign in again.'],
  [/failed to fetch|networkerror|network request failed|fetch.*failed|econnrefused/i, 'Unable to connect to the server. Please check your internet connection.'],
  [/insufficient stock|out of stock/i, 'Not enough stock available for this item.'],
  [/invalid credentials|incorrect password|wrong password|invalid password/i, 'Incorrect email or password.'],
  [/account not found|user not found|email not found/i, 'No account found with this email address.'],
  [/account not verified/i, 'Your account has not been verified.'],
  [/account.*disabled|account.*suspended|account.*blocked/i, 'Your account has been suspended. Please contact support.'],
  [/invalid otp|otp.*expired|otp.*invalid|incorrect otp/i, 'The verification code is incorrect or has expired.'],
  [/subscription.*expired|expired.*subscription/i, 'Your subscription has expired. Please renew to continue.'],
  [/forbidden|access denied|not authorized|unauthorized/i, "You don't have permission to perform this action."],
  [/not found|does not exist|no.*found/i, 'The requested item could not be found.'],
  [/already exists|already registered|already in use/i, 'This record already exists.'],
  [/invalid email/i, 'Please enter a valid email address.'],
  [/password.*too short|password.*must be at least/i, 'Password must be at least 8 characters long.'],
  [/passwords do not match|password.*mismatch/i, 'Passwords do not match.'],
  [/file too large|file size/i, 'The file is too large. Please upload a smaller file.'],
  [/invalid file type|unsupported file/i, 'Unsupported file type. Please upload a valid file.'],
];

const TECHNICAL_PREFIXES = /^(ValidationError|MongoServerError|MongoError|CastError|Error|TypeError|ReferenceError):\s*/i;

export function formatError(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.';

  const raw = error instanceof Error ? error.message : String(error);

  if (!raw || raw === '[object Object]') return 'Something went wrong. Please try again.';

  const cleaned = raw.replace(TECHNICAL_PREFIXES, '').trim();

  for (const [pattern, friendly] of PATTERNS) {
    if (pattern.test(cleaned)) return friendly;
  }

  // Reject anything that looks technical: stack traces, code references, very long strings
  if (
    cleaned.length > 120 ||
    /at\s+\w+\s*\(/.test(cleaned) || // stack trace
    /\.(ts|js|tsx|jsx):\d+/.test(cleaned) || // file references
    /\bmongoose\b|\bmongo\b|\bsql\b|\bprisma\b/i.test(cleaned) // DB names
  ) {
    return 'Something went wrong. Please try again.';
  }

  // Capitalise and return if it looks readable
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
