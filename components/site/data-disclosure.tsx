export const validAsOf = (value?: string) =>
  !!value && Number.isFinite(Date.parse(value));
