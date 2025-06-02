"use client";

import { useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const initialState = {
  message: "",
  error: "",
};

async function loginAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string; error?: string }> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return { message: "", error: data.error || "Login failed" };
    }

    return { message: data.message };
  } catch (error) {
    return {
      message: "",
      error: "Something went wrong. Please try again.",
    };
  }
}

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const { toast } = useToast();
  const router = useRouter(); // 👈 router for redirection

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (state?.message && !state.error) {
      toast({
        title: "Success",
        description: state.message,
      });
      form.reset();
      router.push("/"); // 👈 redirect to home page
    }
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast, form, router]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Login to SecureBase</CardTitle>
        <CardDescription>
          Access your account to manage your security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="you@example.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder="••••••••"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Link href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
