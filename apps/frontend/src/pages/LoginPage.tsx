import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/ui/AuthLayout";
import ErrorAlert, { FieldErrorsNotice } from "../components/ui/ErrorAlert";
import { authInputClassName, getErrorMessage, parseApiError } from "../utils/authErrors";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      await login(email, password);
      navigate("/");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      setError(getErrorMessage(err, parsed.message ?? "Failed to sign in."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your support tickets">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <ErrorAlert message={error} /> : null}
        {Object.keys(fieldErrors).length > 0 ? <FieldErrorsNotice /> : null}

        <label className="auth-label">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            className={authInputClassName(Boolean(fieldErrors.email))}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email ? (
            <p id="email-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.email}
            </p>
          ) : null}
        </label>

        <label className="auth-label">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError("password");
            }}
            className={authInputClassName(Boolean(fieldErrors.password))}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          {fieldErrors.password ? (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.password}
            </p>
          ) : null}
        </label>

        <button type="submit" disabled={submitting} className="btn-primary-full mt-2">
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-footer-text">
          No account?{" "}
          <Link to="/register" className="auth-footer-link">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
