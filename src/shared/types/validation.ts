// Validation types and schemas

export interface ValidationRule<T = any> {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

export interface ValidationSchema<T = any> {
  [K in keyof T]?: ValidationRule<T[K]>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

export interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface FormValidation<T = any> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
  warnings?: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
}

export interface ValidationContext {
  values: Record<string, any>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

export interface AsyncValidationRule<T = any> {
  validate: (value: T, context: ValidationContext) => Promise<string | null>;
  debounce?: number;
  dependencies?: string[];
}

export interface ValidationConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  debounce?: number;
  stopOnFirstError?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationState {
  isValid: boolean;
  isValidating: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
  lastValidated?: string;
}

export interface ValidationHook<T = any> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  warnings?: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isValidating: boolean;
  validate: () => Promise<boolean>;
  validateField: (field: keyof T) => Promise<boolean>;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  setDirty: (field: keyof T, dirty: boolean) => void;
  reset: () => void;
  submit: () => Promise<boolean>;
}

export interface ValidationProvider {
  validate: <T>(schema: ValidationSchema<T>, values: T) => Promise<ValidationResult>;
  validateField: <T>(schema: ValidationSchema<T>, field: keyof T, value: T[keyof T], context: ValidationContext) => Promise<FieldValidation>;
  register: (name: string, rule: ValidationRule) => void;
  unregister: (name: string) => void;
}

export interface ValidationMiddleware {
  beforeValidate?: (values: any, schema: ValidationSchema) => any;
  afterValidate?: (result: ValidationResult) => ValidationResult;
  onError?: (error: ValidationError) => void;
  onWarning?: (warning: ValidationWarning) => void;
}
