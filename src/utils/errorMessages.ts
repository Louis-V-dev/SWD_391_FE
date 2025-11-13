/**
 * Normalize backend error messages so users see friendly, consistent feedback.
 */
type ErrorContext =
  | 'auth'
  | 'auth/login'
  | 'auth/register'
  | 'auth/complete-profile'
  | 'auth/verify'
  | 'auth/forgot-password'
  | 'auth/reset-password'
  | 'items'
  | 'admin'
  | 'admin/items'
  | 'admin/categories'
  | 'admin/brands'
  | 'admin/donations'
  | 'admin/users'
  | 'checkout'
  | 'payments'
  | 'users'
  | 'points'
  | 'chat'
  | 'profile'
  | 'generic';

interface ErrorRule {
  contexts?: ErrorContext[];
  includes: string[];
  message: string;
}

const prefixPatterns: RegExp[] = [
  /^(login|registration|profile|verification|password reset|forgot password|item|order|request)\s+failed:?\s*/i,
  /^error:\s*/i,
  /^exception:\s*/i,
];

const rules: ErrorRule[] = [
  {
    contexts: ['auth', 'auth/login'],
    includes: ['bad credentials'],
    message: 'Invalid email/username or password. Please try again.',
  },
  {
    contexts: ['auth', 'auth/login'],
    includes: ['account locked'],
    message: 'Your account is locked. Please contact support for assistance.',
  },
  {
    contexts: ['auth', 'auth/login'],
    includes: ['disabled'],
    message: 'Your account is disabled. Please contact support for assistance.',
  },
  {
    contexts: ['auth', 'auth/register'],
    includes: ['already exists', 'duplicate', 'email already in use'],
    message: 'An account with that email already exists. Try signing in instead.',
  },
  {
    contexts: ['auth', 'auth/register'],
    includes: ['password'],
    message:
      'Password must meet the required strength. Please include uppercase, lowercase, number, and special character.',
  },
  {
    contexts: ['auth', 'auth/complete-profile'],
    includes: ['phone number must be 10 digits'],
    message: 'Phone number must be 10 digits and start with 0.',
  },
  {
    contexts: ['auth', 'auth/complete-profile', 'auth/register'],
    includes: ['phone number'],
    message:
      'Please enter a valid phone number using digits only. Example: 0912345678.',
  },
  {
    contexts: ['auth', 'auth/verify'],
    includes: ['token is invalid', 'token expired', 'token has expired'],
    message: 'This verification link is invalid or has expired. Request a new verification email.',
  },
  {
    contexts: ['auth', 'auth/forgot-password', 'auth/reset-password'],
    includes: ['token', 'expired'],
    message: 'Your reset link is invalid or has expired. Request a new password reset email.',
  },
  {
    contexts: ['items', 'admin', 'admin/items'],
    includes: ['not found'],
    message: 'We couldn’t find the item you’re looking for.',
  },
  {
    contexts: ['admin', 'admin/items', 'admin/categories', 'admin/brands', 'admin/users'],
    includes: ['forbidden', 'permission', 'access denied', 'unauthorized'],
    message: 'You do not have permission to perform this action.',
  },
  {
    contexts: ['admin', 'admin/items', 'items', 'checkout', 'profile'],
    includes: ['already exists', 'duplicate'],
    message: 'A record with similar details already exists. Please review your input.',
  },
  {
    contexts: ['payments', 'checkout'],
    includes: ['insufficient', 'not enough'],
    message: 'Your balance is insufficient to complete this transaction.',
  },
  {
    contexts: ['admin', 'admin/items', 'admin/categories', 'admin/brands', 'admin/users', 'items', 'checkout', 'profile', 'chat'],
    includes: ['validation', 'invalid', 'must not', 'must be', 'should not'],
    message: 'Some fields look invalid. Please review your input and try again.',
  },
  {
    includes: ['user not found', 'no user', 'not registered'],
    message: 'We couldn’t find an account with those credentials.',
  },
  {
    includes: ['permission denied', 'unauthorized'],
    message: 'You don’t have permission to perform this action.',
  },
  {
    includes: ['network error', 'failed to fetch'],
    message: 'Network error. Please check your internet connection and try again.',
  },
  {
    includes: ['timeout'],
    message: 'The request timed out. Please try again in a moment.',
  },
];

const normalizeMessage = (message: string): string => {
  let normalized = message.trim();
  prefixPatterns.forEach((pattern) => {
    normalized = normalized.replace(pattern, '').trim();
  });
  normalized = normalized.replace(/\s+/g, ' ');
  return normalized;
};

const resolveErrorMessage = (input: unknown): string | undefined => {
  if (typeof input === 'string') return input;
  if (input instanceof Error) return input.message;
  if (input && typeof input === 'object' && 'message' in input) {
    return String((input as { message?: unknown }).message);
  }
  return undefined;
};

const doesContextMatch = (ruleContexts: ErrorContext[] | undefined, context: ErrorContext): boolean => {
  if (!ruleContexts || ruleContexts.length === 0) {
    return true;
  }

  return ruleContexts.some((ruleContext) => {
    if (ruleContext === context) return true;
    if (context.startsWith(`${ruleContext}/`)) return true;
    return false;
  });
};

export const formatApiError = (
  error: unknown,
  context: ErrorContext,
  fallback: string
): string => {
  const rawMessage = resolveErrorMessage(error);
  if (!rawMessage) {
    return fallback;
  }

  const normalized = normalizeMessage(rawMessage);
  const lower = normalized.toLowerCase();

  const matchingRule =
    rules.find((rule) => {
      const contextMatches = doesContextMatch(rule.contexts, context);
      return (
        contextMatches &&
        rule.includes.some((phrase) => lower.includes(phrase.toLowerCase()))
      );
    }) ??
    rules.find((rule) =>
      rule.includes.some((phrase) => lower.includes(phrase.toLowerCase()))
    );

  if (matchingRule) {
    return matchingRule.message;
  }

  const message = normalized || fallback;
  return message.charAt(0).toUpperCase() + message.slice(1);
};

export type { ErrorContext };
