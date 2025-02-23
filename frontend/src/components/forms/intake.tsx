"use client";

import type React from "react";

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

function parseAIResponse(response: string): DrinkData | null {
  try {
    // Remove markdown code block syntax and parse JSON
    const jsonStr = response.replace(/```json\n|\n```/g, "");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return null;
  }
}

interface DrinkData {
  drink_name: string;
  calories: string;
  total_fat: string;
  sodium: string;
  total_carbohydrate: string;
  sugar: string;
  added_sugar: string;
  protein: string;
  caffeine: string;
  serving_size: string;
}

export function CaffeineLogDialog() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [drinkData, setDrinkData] = useState<DrinkData | null>(null);
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

  async function handleConfirmation() {
    try {
      const response = await fetch("/api/confirm-caffeine-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form.getValues(), ...drinkData }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm submission");
      }

      // Reset form and close dialog
      form.reset();
      setImagePreview(null);
      setStep(1);
      setDrinkData(null);
    } catch (error) {
      console.error("Error confirming submission:", error);
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
      const data = (await response.json()) as {
        analysis: { raw_response: string };
      };
      setDrinkData(parseAIResponse(data.analysis.raw_response));
      setStep(3);
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
            {step === 1 && (
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
            )}

            {step === 2 && (
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

            {step === 3 && drinkData && (
              <div className="grid gap-4 py-4">
                <h3 className="text-lg font-semibold">Confirm Drink Details</h3>
                <div className="grid gap-2">
                  <p>
                    <strong>Drink Name:</strong> {drinkData.drink_name}
                  </p>
                  <p>
                    <strong>Calories:</strong> {drinkData.calories}
                  </p>
                  <p>
                    <strong>Total Fat:</strong> {drinkData.total_fat}
                  </p>
                  <p>
                    <strong>Sodium:</strong> {drinkData.sodium}
                  </p>
                  <p>
                    <strong>Total Carbohydrate:</strong>{" "}
                    {drinkData.total_carbohydrate}
                  </p>
                  <p>
                    <strong>Sugar:</strong> {drinkData.sugar}
                  </p>
                  <p>
                    <strong>Added Sugar:</strong> {drinkData.added_sugar}
                  </p>
                  <p>
                    <strong>Protein:</strong> {drinkData.protein}
                  </p>
                  <p>
                    <strong>Caffeine:</strong> {drinkData.caffeine}
                  </p>
                  <p>
                    <strong>Serving Size:</strong> {drinkData.serving_size}
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={handleConfirmation}>
                    Confirm
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
