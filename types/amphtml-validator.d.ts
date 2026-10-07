declare module "amphtml-validator" {
  export interface Validator {
    init(): Promise<void>;
    validateString(
      html: string,
      format?: string,
    ): {
      status: string;
      errors: Array<{
        severity: string;
        line: number;
        col: number;
        message: string;
        specUrl?: string;
      }>;
    };
  }
  export function newInstance(code: string): Validator;
}
