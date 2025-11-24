import { IFormField } from "@/types/app";
import { ValidationErrors } from "@/validations/auth";
import React from "react";
import { InputTypes } from "@/constants/enums";
import TextField from "./text-field";
import PasswordField from "./password-field";
import Checkbox from "./checkbox";
import TextArea from "./text-area";
import { Control, useController } from "react-hook-form";

interface Props extends Omit<IFormField, "error"> {
  error?: ValidationErrors;
  control: Control<any>;
  className?: string;
}

const FormFields = (props: Props) => {
  const { type, name, control, error, className, ...rest } = props;
  const { field } = useController({
    name,
    control,
  });

  const fieldProps = {
    ...rest,
    ...field,
    name,
    type,
    error,
  };

  const renderField = (): React.ReactNode => {
    if (type === InputTypes.TEXT || type === InputTypes.EMAIL) {
      return <TextField {...fieldProps} />;
    }
    if (type === InputTypes.PASSWORD) {
      return <PasswordField {...fieldProps} />;
    }
    if (type === InputTypes.CHECKBOX) {
      return <Checkbox {...fieldProps} />;
    }
    if (type === InputTypes.TEXTAREA) {
      return <TextArea {...fieldProps} />;
    }
    return <TextField {...fieldProps} />;
  };
  return <div className={className}>{renderField()}</div>;
};
export default FormFields;
