/* eslint-disable react-hooks/incompatible-library */
"use client";

import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { City, State } from "country-state-city";
import { UpgradeModal } from "@/components/upgrade-modal";
import Image from "next/image";
import { UnsplashImagePicker } from "@/components/unsplash-image-picker";

// HH:MM in 24h
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
  title: z.string().min(5, "Title must be atleast 5 characters long"),
  description: z
    .string()
    .min(20, "Description must be atleast 20 characters long"),
  category: z.string().min(1, "Please select a category"),

  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "End time must be HH:MM"),

  locationType: z.enum(["physical", "online"]).default("physical"),
  venue: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),

  capacity: z.number().min(1, "Capacity must be at least 1"),
  ticketType: z.enum(["free", "paid"]).default("free"),
  ticketPrice: z.number().optional(),
  coverImage: z.string().optional(),
  themeColor: z.string().default("#1e3a8a"),
});

const CreateEvent = () => {
  const router = useRouter();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("limit"); // "limit" or "color"

  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  const { mutate: createEvent, isLoading } = useConvexMutation(
    api.events.createEvent,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      locationType: "physical",
      ticketType: "free",
      capacity: 50,
      themeColor: "#1e3a8a",
      category: "",
      state: "",
      city: "",
      startTime: "",
      endTime: "",
    },
  });

  const themeColor = watch("themeColor");
  const ticketType = watch("ticketType");
  const selectedState = watch("state");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const coverImage = watch("coverImage");

  const indianStates = useMemo(() => State.getStatesOfCountry("IN"), []);
  const cities = useMemo(() => {
    if (!selectedState) return [];
    const st = indianStates.find((s) => s.name === selectedState);
    if (!st) return [];
    return City.getCitiesOfState("IN", st.isoCode);
  }, [selectedState, indianStates]);

  const colorPresets = [
    "#1e3a8a",
    ...(hasPro ? ["#4c1d95", "#065f46", "#92400e", "#7f1d1d", "#831843"] : []),
  ];

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="min-h-screen transition-colors duration-300 px-6 py-8 -mt-6 md:-mt-16 lg:rounded-md"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-5 md:flex-row justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold">Create Event</h1>
          {!hasPro && (
            <p className="text-sm text-muted-foreground mt-2">
              Free: {currentUser?.freeEventsCreated || 0}/1 events created
            </p>
          )}
        </div>

        {/* Ai Event Creator */}
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-[320px_1fr] gap-10">
        {/* Left: Image + theme */}
        <div  className="space-y-6">
            <div 
                className="aspect-square w-full rounded-xl overflow-hidden flex items-center justify-center cursor-pointer border"
                onClick={() => setShowImagePicker(true)}
            >
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        width={500}
                        height={500}
                    />
                ) : (
                    <span className="opacity-60 text-sm">
                        Click to add cover image
                    </span>
                )}
            </div>
        </div>

        {/* Right: Form */}
        <div>right</div>
      </div>

      {/* Unsplash Picker */}
      {showImagePicker && (
        <UnsplashImagePicker
            isOpen={showImagePicker}
            onClose={() => setShowImagePicker(false)}
            onSelect={(url) => {
                setValue("coverImage", url);
                setShowImagePicker(false);
            }}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeReason}
      />
    </div>
  );
};

export default CreateEvent;
