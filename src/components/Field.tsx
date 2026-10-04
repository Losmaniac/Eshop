export { zodErrors, type FieldErrors } from "@/lib/validation";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Common = { name: string; label: ReactNode; error?: string; help?: ReactNode; optional?: boolean };

function Label({ name, label, optional }: Pick<Common, "name" | "label" | "optional">) {
  return (
    <label htmlFor={name} className="field-label">
      {label}
      {optional && <span className="font-normal text-muted"> (nepovinné)</span>}
    </label>
  );
}

function describedBy(name: string, error?: string, help?: ReactNode) {
  return [error && `${name}-error`, help && `${name}-help`].filter(Boolean).join(" ") || undefined;
}

function Messages({ name, error, help }: Pick<Common, "name" | "error" | "help">) {
  return (
    <>
      {help && (
        <p id={`${name}-help`} className="field-help">
          {help}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </>
  );
}

export function TextField({ name, label, error, help, optional, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label name={name} label={label} optional={optional} />
      <input
        id={name}
        name={name}
        className="field-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, help)}
        required={!optional}
        {...props}
      />
      <Messages name={name} error={error} help={help} />
    </div>
  );
}

export function TextArea({ name, label, error, help, optional, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label name={name} label={label} optional={optional} />
      <textarea
        id={name}
        name={name}
        className="field-input min-h-32"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, help)}
        required={!optional}
        {...props}
      />
      <Messages name={name} error={error} help={help} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  error,
  help,
  optional,
  options,
  placeholder,
  ...props
}: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; placeholder?: string }) {
  return (
    <div>
      <Label name={name} label={label} optional={optional} />
      <select
        id={name}
        name={name}
        className="field-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, help)}
        required={!optional}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Messages name={name} error={error} help={help} />
    </div>
  );
}

export function Checkbox({ name, label, error, ...props }: Omit<Common, "help" | "optional"> & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={name}
          name={name}
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-[#141414]"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
        <label htmlFor={name} className="text-[0.9375rem]">
          {label}
        </label>
      </div>
      {error && (
        <p id={`${name}-error`} className="field-error ml-8">
          {error}
        </p>
      )}
    </div>
  );
}

/** Hidden field that only bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
      <label htmlFor="website">Nevyplňujte</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
