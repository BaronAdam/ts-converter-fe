type ToggleSwitchProps = {
  labelTextInactive: string;
  labelTextActive: string;
  callback?: (isChecked: boolean)=>void;
  disabled?: boolean;
}