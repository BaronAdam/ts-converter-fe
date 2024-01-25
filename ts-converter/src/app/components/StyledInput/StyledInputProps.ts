import { InputTypes } from "./InputTypes";

export type StyledInputProps = {
  placeholderText: string;
  value: string,
  setValue: (value: string) => void;
  type?: InputTypes;
}