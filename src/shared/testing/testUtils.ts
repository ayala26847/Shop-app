// Comprehensive test utilities

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, Mock } from 'vitest';

// Wait utilities
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  await waitFor(() => {
    expect(element).not.toBeInTheDocument();
  });
};

export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

export const waitForErrorToAppear = async (errorText: string) => {
  await waitFor(() => {
    expect(screen.getByText(errorText)).toBeInTheDocument();
  });
};

// User interaction utilities
export const user = userEvent.setup();

export const clickButton = async (buttonText: string) => {
  const button = screen.getByRole('button', { name: buttonText });
  await user.click(button);
};

export const fillInput = async (label: string, value: string) => {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  await user.type(input, value);
};

export const selectOption = async (label: string, optionText: string) => {
  const select = screen.getByLabelText(label);
  await user.click(select);
  const option = screen.getByRole('option', { name: optionText });
  await user.click(option);
};

export const checkCheckbox = async (label: string) => {
  const checkbox = screen.getByLabelText(label);
  await user.click(checkbox);
};

export const submitForm = async (formTestId?: string) => {
  const form = formTestId 
    ? screen.getByTestId(formTestId)
    : screen.getByRole('form');
  const submitButton = within(form).getByRole('button', { name: /submit|save|create|update/i });
  await user.click(submitButton);
};

// Assertion utilities
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeVisible();
};

export const expectElementToBeHidden = (element: HTMLElement) => {
  expect(element).not.toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToHaveClass = (element: HTMLElement, className: string) => {
  expect(element).toHaveClass(className);
};

export const expectElementToHaveAttribute = (element: HTMLElement, attribute: string, value?: string) => {
  if (value) {
    expect(element).toHaveAttribute(attribute, value);
  } else {
    expect(element).toHaveAttribute(attribute);
  }
};

export const expectElementToBeDisabled = (element: HTMLElement) => {
  expect(element).toBeDisabled();
};

export const expectElementToBeEnabled = (element: HTMLElement) => {
  expect(element).toBeEnabled();
};

export const expectElementToBeRequired = (element: HTMLElement) => {
  expect(element).toBeRequired();
};

export const expectElementToBeChecked = (element: HTMLElement) => {
  expect(element).toBeChecked();
};

export const expectElementToBeUnchecked = (element: HTMLElement) => {
  expect(element).not.toBeChecked();
};

// Form testing utilities
export const expectFormToHaveErrors = (errors: string[]) => {
  errors.forEach(error => {
    expect(screen.getByText(error)).toBeInTheDocument();
  });
};

export const expectFormToBeValid = () => {
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
};

export const expectFormToBeInvalid = () => {
  expect(screen.getByRole('alert')).toBeInTheDocument();
};

export const expectFormToBeSubmitting = () => {
  expect(screen.getByText(/submitting|saving|loading/i)).toBeInTheDocument();
};

export const expectFormToBeSubmitted = () => {
  expect(screen.getByText(/success|submitted|saved/i)).toBeInTheDocument();
};

// API testing utilities
export const mockApiCall = <T>(data: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message: string, status = 500) => {
  const error = new Error(message);
  (error as any).status = status;
  return Promise.reject(error);
};

export const expectApiCallToHaveBeenMade = (mockFn: Mock, ...args: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...args);
};

export const expectApiCallToHaveBeenMadeWith = (mockFn: Mock, ...args: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...args);
};

export const expectApiCallToHaveBeenCalledTimes = (mockFn: Mock, times: number) => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};

// Accessibility testing utilities
export const expectElementToBeAccessible = (element: HTMLElement) => {
  expect(element).toHaveAttribute('aria-label');
  expect(element).toHaveAttribute('role');
};

export const expectElementToHaveAriaLabel = (element: HTMLElement, label: string) => {
  expect(element).toHaveAttribute('aria-label', label);
};

export const expectElementToHaveAriaDescribedBy = (element: HTMLElement, description: string) => {
  expect(element).toHaveAttribute('aria-describedby', description);
};

export const expectElementToHaveAriaExpanded = (element: HTMLElement, expanded: boolean) => {
  expect(element).toHaveAttribute('aria-expanded', expanded.toString());
};

export const expectElementToHaveAriaHidden = (element: HTMLElement, hidden: boolean) => {
  expect(element).toHaveAttribute('aria-hidden', hidden.toString());
};

export const expectElementToHaveAriaLive = (element: HTMLElement, live: 'polite' | 'assertive' | 'off') => {
  expect(element).toHaveAttribute('aria-live', live);
};

// Performance testing utilities
export const measurePerformance = (fn: () => void | Promise<void>) => {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then(() => {
      const end = performance.now();
      return end - start;
    });
  }
  
  const end = performance.now();
  return end - start;
};

export const expectPerformanceToBeUnder = (duration: number, fn: () => void | Promise<void>) => {
  const measuredDuration = measurePerformance(fn);
  
  if (measuredDuration instanceof Promise) {
    return measuredDuration.then((duration) => {
      expect(duration).toBeLessThan(duration);
    });
  }
  
  expect(measuredDuration).toBeLessThan(duration);
};

// Mock utilities
export const createMockFunction = <T extends (...args: any[]) => any>(implementation?: T): Mock<T> => {
  return vi.fn(implementation);
};

export const createMockPromise = <T>(value: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), delay);
  });
};

export const createMockRejectedPromise = (error: Error, delay = 0) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};

// Cleanup utilities
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
};

export const cleanupLocalStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const cleanupDOM = () => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
};

// Test data generators
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateRandomEmail = () => {
  return `${generateRandomString(8)}@example.com`;
};

export const generateRandomNumber = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomDate = (start = new Date(2020, 0, 1), end = new Date()) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Test environment utilities
export const setTestEnvironment = (env: 'development' | 'test' | 'production') => {
  process.env.NODE_ENV = env;
};

export const setTestLanguage = (language: string) => {
  Object.defineProperty(navigator, 'language', {
    value: language,
    writable: true,
  });
};

export const setTestUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent,
    writable: true,
  });
};

export const setTestViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    writable: true,
  });
};
