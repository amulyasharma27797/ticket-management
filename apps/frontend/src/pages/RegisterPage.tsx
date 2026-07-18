import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { inputClassName, parseApiError } from "../utils/authErrors";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      setError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-gradient flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Ticket Management</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Register to manage support tickets</p>

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        {Object.keys(fieldErrors).length > 0 ? (
          <p className="mt-4 text-sm text-amber-600">Please fix the highlighted fields below.</p>
        ) : null}

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Name
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearFieldError("name");
            }}
            className={inputClassName(Boolean(fieldErrors.name))}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          {fieldErrors.name ? (
            <p id="name-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.name}
            </p>
          ) : null}
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            className={inputClassName(Boolean(fieldErrors.email))}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email ? (
            <p id="email-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.email}
            </p>
          ) : null}
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError("password");
            }}
            className={inputClassName(Boolean(fieldErrors.password))}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          {fieldErrors.password ? (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.password}
            </p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-sky-600 px-4 py-2.5 font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-sky-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
