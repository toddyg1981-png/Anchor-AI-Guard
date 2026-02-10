/**
 * Custom React Hooks for Security Integration
 * Provides reusable security logic across components
 */

import { useState, useCallback, useMemo } from 'react';
import { sanitizeHtml, sanitizeUrl } from '../utils/sanitization';
import { isValidEmail, isSafeInput, isValidUrl } from '../utils/validation';
import { debounce } from '../utils/rateLimiting';
import { Finding, Project } from '../types';

/**
 * Hook to safely display Finding data with sanitization
 */
export const useSecureFinding = (finding: Finding | null) => {
  return useMemo(() => {
    if (!finding) return null;
    
    return {
      id: finding.id,
      severity: finding.severity,
      type: sanitizeHtml(finding.type),
      description: sanitizeHtml(finding.description),
      guidance: sanitizeHtml(finding.guidance),
      reproduction: sanitizeHtml(finding.reproduction),
      project: sanitizeHtml(finding.project),
    };
  }, [finding]);
};

/**
 * Pure function to sanitize Project data for safe display
 */
export const sanitizeProject = (project: Project | null) => {
  if (!project) return null;

  return {
    ...project,
    name: sanitizeHtml(project.name),
    owner: sanitizeHtml(project.owner),
    scope: {
      domains: project.scope.domains.map(d => sanitizeHtml(d)),
      apis: project.scope.apis.map(a => sanitizeHtml(a)),
      mobileBuilds: project.scope.mobileBuilds.map(m => sanitizeHtml(m)),
    },
  };
};

/**
 * Hook to safely display Project data with sanitization
 */
export const useSecureProject = (project: Project | null) => {
  return useMemo(() => sanitizeProject(project), [project]);
};

/**
 * Hook for validated email input
 */
export const useValidatedEmail = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    if (!value.trim()) {
      setError('Email is required');
      return false;
    }
    if (!isValidEmail(value)) {
      setError('Invalid email format');
      return false;
    }
    setError(null);
    return true;
  }, [value]);

  return {
    value,
    setValue,
    error,
    validate,
    isValid: !error && value.length > 0,
  };
};

/**
 * Hook for validated text input
 */
export const useValidatedInput = (
  initialValue: string = '',
  maxLength: number = 1000
) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    if (value.length > maxLength) {
      setError(`Input exceeds maximum length of ${maxLength} characters`);
      return false;
    }
    if (!isSafeInput(value, maxLength)) {
      setError('Input contains potentially unsafe content');
      return false;
    }
    setError(null);
    return true;
  }, [value, maxLength]);

  return {
    value,
    setValue: (newValue: string) => {
      setValue(newValue);
      // Clear error on change
      setError(null);
    },
    error,
    validate,
    isValid: !error && value.length > 0,
    remainingCharacters: maxLength - value.length,
  };
};

/**
 * Hook for debounced search input
 */
export const useDebouncedSearch = (
  onSearch: (query: string) => void,
  delayMs: number = 500
) => {
  const [value, setValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (isSafeInput(query, 500)) {
        setIsSearching(true);
        onSearch(query);
        // Simulate search completion
        setTimeout(() => setIsSearching(false), 300);
      }
    }, delayMs),
    [onSearch, delayMs]
  );

  const handleChange = useCallback((query: string) => {
    setValue(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  return {
    value,
    setValue: handleChange,
    isSearching,
    clear: () => setValue(''),
  };
};

/**
 * Hook for safe URL handling
 */
export const useSafeUrl = (initialUrl: string = '') => {
  const [value, setValue] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    if (!value.trim()) {
      setError('URL is required');
      return false;
    }
    if (!isValidUrl(value)) {
      setError('Invalid URL format');
      return false;
    }
    setError(null);
    return true;
  }, [value]);

  const safeUrl = useMemo(() => sanitizeUrl(value), [value]);

  return {
    value,
    setValue,
    safeUrl,
    error,
    validate,
    isValid: !error && safeUrl.length > 0,
  };
};

/**
 * Hook to manage form validation state
 */
export const useFormValidation = (
  initialValues: Record<string, string> = {}
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setError,
    reset,
    isValid: Object.keys(errors).every(key => !errors[key]),
  };
};

/**
 * Hook for secure data filtering
 */
export const useSecureFilter = (
  data: any[],
  filterFn: (item: any, query: string) => boolean
) => {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!isSafeInput(query, 500)) {
      return data;
    }
    return data.filter(item => filterFn(item, query));
  }, [data, query, filterFn]);

  return {
    query,
    setQuery,
    filteredData,
    resultCount: filteredData.length,
  };
};
