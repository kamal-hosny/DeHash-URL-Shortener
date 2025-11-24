import { IFormField } from "@/types/app";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { ValidationErrors } from "@/validations/auth";

interface Props extends IFormField {
  error?: ValidationErrors;
}

const TextArea = ({
  label,
  name,
  placeholder,
  disabled,
  autoFocus,
  error,
  readOnly,
  onChange,
  onBlur,
  value,
  ref,
}: Props & {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  value: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="capitalize text-foreground mb-2">
        {label}
      </Label>
      <Textarea
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
  );
};

export default TextArea;
