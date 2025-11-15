import { IFormField } from "@/types/app";
import { Input } from "../../ui/input";
import { Label  } from "../../ui/label";
import { ValidationErrors } from "@/validations/auth";

interface Props extends IFormField {
  error?: ValidationErrors;
}

const TextField = ({
  label,
  name,
  type,
  placeholder,
  disabled,
  autoFocus,
  error,
  defaultValue,
  readOnly,
  onChange,
  onBlur,
  value,
  ref,
}: Props & {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  value: any;
  ref?: React.Ref<HTMLInputElement>;
}) => {
    return (
 <div className="space-y-2">
      <Label htmlFor={name} className="capitalize text-black mb-2">
        {label}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        readOnly={readOnly}
      />
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


export default TextField;
