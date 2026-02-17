type SupabaseErrorDetails = {
  message: string;
  code?: string | null;
  details?: string | null;
  hint?: string | null;
};

type SupabaseResult = {
  error?: SupabaseErrorDetails | null;
};

export function assertSupabaseOk(result: SupabaseResult) {
  const error = result?.error;
  if (error) {
    const details = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
    throw new Error(`Supabase error: ${JSON.stringify(details)}`);
  }
}
