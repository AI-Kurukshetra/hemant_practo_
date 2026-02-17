export function assertSupabaseOk(result) {
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
