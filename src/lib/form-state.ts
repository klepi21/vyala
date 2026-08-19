/**
 * The shape every form action returns.
 *
 * Expected validation problems come back as a value so the form can show them
 * next to the fields with the typed data intact. Only genuinely unexpected
 * failures throw and reach the error boundary.
 */
export type FormState = { error?: string } | null;

export const formError = (message: string): FormState => ({ error: message });
export const formOk: FormState = null;
