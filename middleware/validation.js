import { z } from 'zod';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
      }
      res.status(400).json({ status: 'error', message: 'Invalid request' });
    }
  };
};

// Zod schemas
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const getNumberSchemaNoUserId = z.object({
  service: z.string().min(1, 'Service is required'),
  country: z.string().min(1, 'Country is required'),
  maxPrice: z.number().optional(),
  providers: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
});

export const walletTopupSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

export const paystackInitSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(100, 'Minimum top-up is ₦100')
    .max(10000000, 'Amount exceeds the maximum top-up limit'),
});

export const accountPurchaseSchema = z.object({
  accountId: z.string().min(1, 'AccountId is required'),
});

export const smsSendSchema = z.object({
  phone: z.string().regex(/^234\d{9}$/, 'Phone number must be a valid Nigerian number (e.g., 2348012345678)'),
  message: z.string().min(1, 'Message is required').max(160, 'Message cannot exceed 160 characters'),
});
