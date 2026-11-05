"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { tenantsApi } from "@/lib/api/tenants";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Modal } from "@/components/ui/Modal";
import type { UserDto, UserRoleApi } from "@/types/api";
export function AccountProvisioning({ account }: { account?: UserDto }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRoleApi>("HOSPITAL_ADMIN");
  const [tenantId, setTenantId] = useState(account?.tenantId || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const qc = useQueryClient();
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (tenantId) {
        const facility = await tenantsApi.getById(tenantId.trim());
        if (facility.status !== "APPROVED")
          throw new Error("Select an approved facility.");
      }
      if (account) await usersApi.assignTenant(account.id, tenantId.trim());
      else {
        if (
          password.length < 8 ||
          !/[A-Z]/.test(password) ||
          !/[a-z]/.test(password) ||
          !/\d/.test(password)
        )
          throw new Error(
            "Use 8+ characters with uppercase, lowercase, and a number.",
          );
        await usersApi.adminCreate({
          username: username.trim(),
          email: email.trim(),
          password,
          role,
          tenantId: tenantId.trim() || null,
        });
      }
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
      await qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save account.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Button
        size={account ? "sm" : "md"}
        variant={account ? "outline" : "primary"}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        {account ? "Assign facility" : "Create staff account"}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => {
          if (!busy) {
            setOpen(false);
            setPassword("");
          }
        }}
        title={
          account ? `Assign ${account.username}` : "Create a staff account"
        }
        description="Facility staff require an approved facility assignment. Use a temporary password and share it through your approved secure channel."
      >
        <form onSubmit={save} className="space-y-4">
          {!account && (
            <>
              <Field label="Username" required>
                <Input
                  required
                  minLength={3}
                  maxLength={50}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Field label="Email" required>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field
                label="Temporary password"
                required
                hint="8+ characters with uppercase, lowercase, and a number."
              >
                <PasswordInput
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Role" required>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRoleApi)}
                >
                  {[
                    "HOSPITAL_ADMIN",
                    "RECEPTIONIST",
                    "LAB_TECHNICIAN",
                    "DOCTOR",
                    "ADMIN",
                  ].map((r) => (
                    <option key={r} value={r}>
                      {r.replaceAll("_", " ")}
                    </option>
                  ))}
                </Select>
              </Field>
            </>
          )}
          <Field
            label="Approved facility ID"
            required={
              !!account ||
              ["HOSPITAL_ADMIN", "RECEPTIONIST", "LAB_TECHNICIAN"].includes(
                role,
              )
            }
            hint="Copy this ID from the facility directory."
          >
            <Input
              required={
                !!account ||
                ["HOSPITAL_ADMIN", "RECEPTIONIST", "LAB_TECHNICIAN"].includes(
                  role,
                )
              }
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
            />
          </Field>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}
          <Button type="submit" loading={busy}>
            {account ? "Save assignment" : "Create account"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
