"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validation/auth";

export type AuthMode = "login" | "register";

const schemaMap = {
  login: loginSchema,
  register: registerSchema
} as const;

type Props = {
  mode: AuthMode;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (values: LoginInput | RegisterInput) => void;
  demoUsers?: Array<{
    label: string;
    email: string;
    password: string;
  }>;
};

export function AuthForm({ mode, isLoading, error, onSubmit, demoUsers }: Props) {
  const schema = schemaMap[mode];
  const isRegister = mode === "register";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginInput | RegisterInput>({
    resolver: zodResolver(schema),
    defaultValues: useMemo(() => ({ email: "", password: "", name: "" }), [])
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: "100%", display: "grid", gap: 2 }}
    >
      <Typography variant="h4" fontWeight={700}>
        {isRegister ? "Create your account" : "Welcome back"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {isRegister
          ? "Spin up a secure workspace with JWT auth and Mongo persistence."
          : "Sign in to view and manage your todos."}
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {isRegister ? (
        <TextField
          label="Full name"
          {...register("name")}
          error={"name" in errors && !!errors.name}
          helperText={(errors as Record<string, { message?: string }>).name?.message}
        />
      ) : null}

      <TextField
        label="Email"
        type="email"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message as string}
      />

      <TextField
        label="Password"
        type="password"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message as string}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
        {!isRegister && demoUsers?.length ? (
          <Stack direction="row" gap={1}>
            {demoUsers.map((user) => (
              <Button
                key={user.label}
                type="button"
                size="small"
                onClick={() => {
                  setValue("email", user.email);
                  setValue("password", user.password);
                }}
              >
                {user.label}
              </Button>
            ))}
          </Stack>
        ) : null}
      </Stack>

      <Button type="submit" disabled={isLoading} size="large">
        {isRegister ? "Create account" : "Sign in"}
      </Button>
      <Typography variant="caption" color="text.secondary">
          Tokens refresh automatically every 15 minutes.
      </Typography>
    </Box>
  );
}
