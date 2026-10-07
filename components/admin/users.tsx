"use client";
import { useEffect, useState, useCallback } from "react";
import type { UserSummary, Role } from "@/lib/cms/types";
import { api, mutation, errorMessage } from "./api";
import {
  PageHeading,
  Panel,
  Field,
  Input,
  Select,
  Button,
  Feedback,
  Loading,
  Empty,
  Badge,
  useDirtyGuard,
} from "./primitives";
export function Users() {
  const [rows, setRows] = useState<UserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [editing, setEditing] = useState<UserSummary | null | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("author");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dirty, setDirty] = useState(false);
  useDirtyGuard(dirty);
  const requestPage = useCallback(
    () =>
      api<{ data: UserSummary[]; total: number }>(
        `/api/admin/users?q=${encodeURIComponent(query)}&status=${role}&page=${page}&sort=${sort}&direction=${direction}`,
      ),
    [query, role, page, sort, direction],
  );
  const load = useCallback(async () => {
    try {
      const result = await requestPage();
      setRows(result.data);
      setTotal(result.total);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [requestPage]);
  useEffect(() => {
    let active = true;
    requestPage()
      .then((result) => {
        if (active) {
          setRows(result.data);
          setTotal(result.total);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestPage]);
  function edit(user: UserSummary | null) {
    if (dirty && !window.confirm("Discard unsaved user changes?")) return;
    setEditing(user);
    setName(user?.name || "");
    setEmail(user?.email || "");
    setNewRole(user?.role || "author");
    setActive(user?.active ?? true);
    setPassword("");
    setDirty(false);
    setError("");
    setSuccess("");
  }
  return (
    <>
      <PageHeading
        title="Users"
        description="Workspace roles and active accounts. Public author profiles are managed separately."
        actions={<Button onClick={() => edit(null)}>Create user</Button>}
      />
      <Feedback error={error} success={success} />
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(q);
          setPage(1);
        }}
      >
        <Field label="Search users">
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Field>
        <Field label="Role filter">
          <Select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {["admin", "editor", "author", "customer"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Field label="Sort users">
          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
              setLoading(true);
            }}
          >
            <option value="createdAt">Date created</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
          </Select>
        </Field>
        <Field label="User sort direction">
          <Select
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              setPage(1);
              setLoading(true);
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
        </Field>
        <Button>Search</Button>
      </form>
      {editing !== undefined && (
        <Panel title={editing ? "Edit user" : "Create user"}>
          <form
            onChange={() => setDirty(true)}
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await mutation(
                  editing
                    ? `/api/admin/users/${editing.id}`
                    : "/api/admin/users",
                  editing ? "PATCH" : "POST",
                  {
                    name,
                    email,
                    role: newRole,
                    active,
                    ...(password ? { password } : {}),
                  },
                );
                setDirty(false);
                setEditing(undefined);
                setSuccess("User saved.");
                await load();
              } catch (cause) {
                setError(errorMessage(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid-two">
              <Field label="User name">
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="User email">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="User role">
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                >
                  {["admin", "editor", "author", "customer"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </Select>
              </Field>
              <Field
                label={editing ? "New password (optional)" : "Initial password"}
                hint="At least 12 characters. Leave empty on edits to keep the current password."
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required={!editing}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active account
            </label>
            <div className="actions">
              <Button disabled={busy}>{busy ? "Saving…" : "Save user"}</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!dirty || window.confirm("Discard unsaved changes?")) {
                    setEditing(undefined);
                    setDirty(false);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      )}
      {loading ? (
        <Loading />
      ) : rows.length ? (
        <div className="table-container">
          <table>
            <caption>{total} matching users</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <th scope="row">{user.name}</th>
                  <td>{user.email}</td>
                  <td>
                    <Badge>{user.role}</Badge>
                  </td>
                  <td>{user.active ? "Active" : "Inactive"}</td>
                  <td>
                    <Button variant="secondary" onClick={() => edit(user)}>
                      Edit {user.name}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No users match your search.</Empty>
      )}
      <div className="pagination">
        <p>
          Page {page} of {Math.max(1, Math.ceil(total / 20))}
        </p>
        <div className="actions">
          <Button
            variant="secondary"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={page * 20 >= total || loading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
