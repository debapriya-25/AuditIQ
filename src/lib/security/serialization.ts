/**
 * Picks explicit safe fields from an object. 
 * Highly recommended over blacklisting for shareable URLs to prevent accidental 
 * exposure of internal metadata or new PII fields added later.
 */
export function pickSafeFields<T extends Record<string, unknown>, K extends keyof T>(
  obj: T, 
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Strips known sensitive fields (PII, secrets, internal metadata) from an object.
 * Useful for logging or generic serialization where picking is too strict.
 */
export function stripSensitiveFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const clone = { ...obj };
  const sensitiveKeys = [
    'email', 
    'companyName', 
    'role', 
    'teamSize', 
    'password', 
    'token', 
    'secret',
    'internal_metadata',
    'id' // often internal UUIDs shouldn't be blindly exposed unless explicitly picked
  ];
  
  for (const key of sensitiveKeys) {
    delete clone[key];
  }
  return clone;
}

/**
 * Recursively strips sensitive fields from an unknown payload.
 */
export function safeSerialize(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(safeSerialize);
  }
  
  if (data !== null && typeof data === 'object') {
    const safeObj: Record<string, unknown> = {};
    const sensitive = new Set(['email', 'companyName', 'role', 'password', 'token', 'secret']);
    
    for (const [key, value] of Object.entries(data)) {
      if (!sensitive.has(key)) {
        safeObj[key] = safeSerialize(value);
      }
    }
    return safeObj;
  }
  
  return data;
}
