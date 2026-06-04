import type { TextFieldProps } from '@mui/material/TextField';

import { useState, useEffect } from 'react';

import TextField from '@mui/material/TextField';

import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export type NumericInputProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: number;
  onChangeValue?: (value: number) => void;
};

export function NumericInput({ value, onChangeValue, onFocus, onBlur, ...other }: NumericInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Update internal input value when prop value changes from outside
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value === 0 ? '0' : fNumber(value));
    }
  }, [value, isFocused]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (value === 0) {
      setInputValue('');
    } else {
      setInputValue(value.toString());
    }
    if (onFocus) onFocus(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // When blurring, we format the value
    setInputValue(value === 0 ? '0' : fNumber(value));
    if (onBlur) onBlur(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/,/g, '');
    
    // CHANGED: Added '-?' to the regex to allow an optional leading negative sign
    if (rawValue === '' || /^-?\d*\.?\d*$/.test(rawValue)) {
      setInputValue(rawValue);
      
      // CHANGED: Treat incomplete typing states (like just '-', '.', or '-.') as 0 
      // so we don't pass NaN up to the parent component.
      const isIncomplete = rawValue === '' || rawValue === '-' || rawValue === '.' || rawValue === '-.';
      const numericValue = isIncomplete ? 0 : parseFloat(rawValue);
      
      if (onChangeValue) {
        onChangeValue(numericValue);
      }
    }
  };

  return (
    <TextField
      {...other}
      value={isFocused ? inputValue : (value === 0 ? '0' : fNumber(value))}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
}