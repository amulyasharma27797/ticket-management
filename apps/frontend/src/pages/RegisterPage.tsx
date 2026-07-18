import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/ui/AuthLayout";
import { authInputClassName, parseApiError } from "../utils/authErrors";
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
    <AuthLayout title="Create your account" subtitle="Join the team and start managing tickets">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {Object.keys(fieldErrors).length > 0 ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Please fix the highlighted fields below.
          </p>
        ) : null}

        <label className="auth-label">
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
            className={authInputClassName(Boolean(fieldErrors.name))}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          {fieldErrors.name ? (
            <p id="name-error" className="mt-1 text-xs text-red-500">
              {fieldErrors.name}
            </p>
          ) : null}
        </label>

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
            minLength={8}
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
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-footer-link">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
