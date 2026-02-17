"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
};

export default function SubmitButton({
  pendingText = "Saving...",
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = Boolean(disabled || pending);

  return (
    <button {...props} disabled={isDisabled}>
      {pending ? pendingText : children}
    </button>
  );
}
