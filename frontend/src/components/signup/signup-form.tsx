import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
//import { SignUpResponse } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(50),
  password: z.string().min(8).max(50),
  confirmPassword: z.string().min(8).max(50),
});

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/register/", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          username: values.username,
          password: values.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        // Check if the response contains a structured error
        if (data && typeof data === "object") {
          const errorMessages: string[] = [];

          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // Django Rest Framework usually sends errors as an array
              value.forEach((msg) => errorMessages.push(`${key}: ${msg}`));
            } else {
              errorMessages.push(`${key}: ${value}`);
            }
          });

          if (errorMessages.length > 0) {
            toast.error(errorMessages.join("\n"));
          } else {
            toast.error("Sign up failed. Please check your inputs.");
          }
        } else {
          // Fallback for unknown error structure
          toast.error(data?.message || "An unknown error occurred.");
        }
      } else {
        localStorage.setItem("jwt_token", data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup request failed:", error);
      toast.error("Network error. Please try again later.");
    }

    setLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Sign Up</CardTitle>
          <CardDescription>Sign up to your account below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="m@example.com"
                            required
                            className={cn(
                              "bg-background/98",
                              fieldState.invalid && "border-red-500"
                            )}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="text-red-500 text-sm">
                            {fieldState.error.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="username"
                            placeholder="Username"
                            autoComplete="username"
                            required
                            className={cn(
                              "bg-background/98",
                              fieldState.invalid && "border-red-500"
                            )}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="text-red-500 text-sm">
                            {fieldState.error.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="Enter a password"
                            className={cn(
                              "bg-background/98",
                              fieldState.invalid && "border-red-500"
                            )}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="text-red-500 text-sm">
                            {fieldState.error.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="Confirm your password"
                            className={cn(
                              "bg-background/98",
                              fieldState.invalid && "border-red-500"
                            )}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <FormMessage className="text-red-500 text-sm">
                            {fieldState.error.message}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 pt-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : "Sign Up"}
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-md">
                Already have an account?{" "}
                <a href="/" className="underline underline-offset-4">
                  Log in
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
