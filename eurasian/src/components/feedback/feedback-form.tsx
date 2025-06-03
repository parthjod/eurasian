"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submitFeedback, type FeedbackFormState } from "@/app/feedback/actions";
import { useToast } from "@/hooks/use-toast";

const feedbackSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  feedbackType: z.enum(["bug", "feature", "general"], {
    message: "Please select a feedback type.",
  }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(1000, { message: "Message must be at most 1000 characters." }),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const initialState: FeedbackFormState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Submitting..." : "Submit Feedback"}
    </Button>
  );
}

export default function FeedbackForm() {
  const [state, formAction] = useActionState(submitFeedback, initialState);
  const { toast } = useToast();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      email: state.fields?.email || "",
      feedbackType:
        (state.fields?.feedbackType as "bug" | "feature" | "general") || undefined,
      message: state.fields?.message || "",
    },
  });

  useEffect(() => {
    if (state?.message && !state.error) {
      toast({
        title: "Success!",
        description: state.message,
        open: true,
        onOpenChange: () => {},
      });
      form.reset({ email: "", feedbackType: undefined, message: "" });
    }

    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
        open: true,
        onOpenChange: () => {},
      });
    }

    if (state.fields) {
      form.reset({
        email: state.fields.email || "",
        feedbackType:
          (state.fields.feedbackType as "bug" | "feature" | "general") || undefined,
        message: state.fields.message || "",
      });
    }
  }, [state, toast, form]);

  const getErrorForField = (fieldName: keyof FeedbackFormValues): string | undefined => {
    return state.issues
      ?.find((issue) => issue.startsWith(`${fieldName}:`))
      ?.split(": ")[1];
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Submit Feedback</CardTitle>
        <CardDescription>We value your input! Help us improve SecureBase.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="you@example.com"
              aria-describedby="email-error"
            />
            {getErrorForField("email") && (
              <p id="email-error" className="text-sm text-destructive">
                {getErrorForField("email")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedbackType">Feedback Type</Label>
            <Select
              name="feedbackType"
              onValueChange={(value: "bug" | "feature" | "general") =>
                form.setValue("feedbackType", value)
              }
              value={form.watch("feedbackType")}
            >
              <SelectTrigger id="feedbackType" aria-describedby="feedbackType-error">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
              </SelectContent>
            </Select>
            {getErrorForField("feedbackType") && (
              <p id="feedbackType-error" className="text-sm text-destructive">
                {getErrorForField("feedbackType")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              {...form.register("message")}
              placeholder="Tell us what you think..."
              rows={5}
              aria-describedby="message-error"
            />
            {getErrorForField("message") && (
              <p id="message-error" className="text-sm text-destructive">
                {getErrorForField("message")}
              </p>
            )}
          </div>

          {state?.error && !state.issues?.length && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state?.message && !state.error && (
            <p className="text-sm text-green-600">{state.message}</p>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
