"use client";
import { IFormField } from "@/types/app";
import { ValidationErrors } from "@/validations/auth";
import { Input } from "../../ui/input";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/assets/icons";

interface Props extends IFormField {
  error: ValidationErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  value: string;
  ref?: React.Ref<HTMLInputElement>;
}

interface IState {
  showPassword: boolean;
}

const INITIAL_STATE: IState = { showPassword: false };

const PasswordField = ({
  label,
  name,
  placeholder,
  disabled,
  autoFocus,
  error,
  onChange,
  onBlur,
  value,
  ref,
}: Props) => {
  const [state, setState] = useState<IState>(INITIAL_STATE);
  const { showPassword } = state;
  const handleClickShowPassword = () => setState((prevState) => ({
    ...prevState,
    showPassword: !prevState.showPassword,
  }))
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="capitalize text-foreground">
        {label}
      </label>
      <div className="relative flex items-center">
        <Input 
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          name={name}
          id={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
        />

        <button
          type="button"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          className={`absolute end-3`}
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && error[name] && (
        <p 
          className={`text-accent mt-2 text-sm font-medium ${
            error[name] ? "text-destructive" : ""
          }`}
        >
          {error[name]}
        </p>
      )}
    </div>
  )
}

export default PasswordField;
