import { useState, useEffect } from 'react';

import TextField from '@mui/material/TextField';

import { fNumber } from 'src/utils/format-number';

import type { TextFieldProps } from '@mui/material/TextField';

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
    
    // Only allow non-negative integers
    if (/^\d*$/.test(rawValue)) {
      const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
      setInputValue(rawValue);
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
