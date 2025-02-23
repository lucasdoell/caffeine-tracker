"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
  image: z.instanceof(File).optional(),
  beverage_size_ml: z
    .number()
    .min(0, "Beverage size must be positive")
    .optional(),
  sugar_content_g: z
    .number()
    .min(0, "Sugar content must be positive")
    .optional(),
  calories_kcal: z.number().min(0, "Calories must be positive").optional(),
  additional_notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CaffeineLogDialog() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];

      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Set the actual file in the form
      form.setValue("image", file);
      setIsUploading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    console.log("Submitting form:", values);
    setLoading(true);

    try {
      const formData = new FormData();

      if (values.image) {
        formData.append("image", values.image);
      }
      if (values.beverage_size_ml !== undefined) {
        formData.append("beverage_size_ml", values.beverage_size_ml.toString());
      }
      if (values.sugar_content_g !== undefined) {
        formData.append("sugar_content_g", values.sugar_content_g.toString());
      }
      if (values.calories_kcal !== undefined) {
        formData.append("calories_kcal", values.calories_kcal.toString());
      }
      if (values.additional_notes) {
        formData.append("additional_notes", values.additional_notes);
      }

      const response = await fetch("/api/ai/submit-drink/", {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("jwt_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Successfully submitted caffeine intake");

      // Reset form and close dialog
      form.reset();
      setImagePreview(null);
      setStep(1);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit");
    }

    setLoading(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" /> Add Caffeine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Caffeine Intake</DialogTitle>
          <DialogDescription>
            Log your caffeine consumption to track your intake.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <FormLabel htmlFor="image">Upload Image</FormLabel>
                  <div className="grid gap-4">
                    {imagePreview ? (
                      <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg border">
                        <img
                          src={imagePreview}
                          alt="Preview of beverage"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <label
                        htmlFor="image"
                        className="flex aspect-square w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50"
                      >
                        {isUploading ? (
                          <Loader2
                            className="h-8 w-8 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Camera className="h-8 w-8" aria-hidden="true" />
                        )}
                        <span>Upload image</span>
                      </label>
                    )}
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      aria-label="Upload beverage image"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Next
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="beverage_size_ml"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beverage Size (ml)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sugar_content_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar Content (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="calories_kcal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add any additional details..."
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
