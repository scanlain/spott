"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "./ui/progress";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { Badge } from "./ui/badge";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { City, State } from "country-state-city";

export function OnBoardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);

  const [selectedInterests, setSelectedInterests] = useState([]);

  const { mutate: completeOnboarding, isLoading } = useConvexMutation(
    api.users.completeOnboarding,
  );

  const [location, setLocation] = useState({
    state: "",
    city: "",
    country: "India",
  });

  const progress = (step / 2) * 100;

  const toggleInterest = (catId) => {
    setSelectedInterests((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id != catId)
        : [...prev, catId],
    );
  };

  const indianStates = State.getStatesOfCountry("IN");

  const cities = useMemo(() => {
    if (!location.state) return [];

    const selectedState = indianStates.find(
      (state) => state.name === location.state,
    );

    if (!selectedState) return [];
    return City.getCitiesOfState("IN", selectedState.isoCode);
  }, [location.state, indianStates]);

  const handleComplete = async () => {
    try {
        await completeOnboarding({
            location: {
                city: location.city,
                state: location.state,
                country: location.country,
            },
            interests: selectedInterests,
        });

        toast.success("Welcome to Spott! 🎉");
        onComplete();
    } catch (error) {
        toast.error("Failed to complete onboarding!")
        console.log(error)
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }

    if (step === 2 && (!location || !location.state)) {
      toast.error("Please select both state and city");
      return;
    }

    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl overflow-visible">
        <DialogHeader>
          <div className="mb-4">
            <Progress value={progress} className={"h-1"} />
          </div>
          <DialogTitle className={"flex items-center gap-2 text-2xl"}>
            {step === 1 ? (
              <>
                <Heart className="w-6 h-6 text-purple-500" />
                What interests you ?
              </>
            ) : (
              <>
                <MapPin className="w-6 h-6 text-purple-500" />
                Where are you located?
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Select at least 3 categories to personalize your experience"
              : "We'll show you events happening near you"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedInterests.includes(cat.id) ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20" : "border-border hover:border-purple-300"}`}
                    onClick={() => toggleInterest(cat.id)}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-medium">{cat.label}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedInterests.length >= 3 ? "default" : "secondary"
                  }
                >
                  {selectedInterests.length} selected
                </Badge>
                {selectedInterests.length >= 3 && (
                  <span className="text-sm text-green-500">
                    ✓ Ready to continue
                  </span>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className={'mb-2'} htmlFor="state">State</Label>
                  <Select 
                    value={location.state}
                    onValueChange={(value) => {
                        setLocation({...location, state: value, city: ""})
                    }}
                  >
                    <SelectTrigger id="state" className="w-full h-11">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]" position="popper">
                      {indianStates.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name}>
                            {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                    <Label className={'mb-2'} htmlFor="city">City</Label>
                  <Select 
                    value={location.city}
                    onValueChange={(value) => {
                        setLocation({...location, city: value})
                    }}
                    disabled={!location.state}
                  >
                    <SelectTrigger id="city" className="w-full h-11">
                      <SelectValue placeholder={location.state ? "Select city" : "State first"} />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]" position="popper">
                      {cities.length > 0 ? (
                        cities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                                {city.name}
                            </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no cities" disabled>
                            No cities available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {location.city && location.state && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-purple-500 mt-0.5"/>
                        <div>
                            <p className="font-medium">Your location</p>
                            <p className="text-sm text-muted-foreground">{location.city}, {location.state} {location.country}</p>
                        </div>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className={"flex gap-3"}>
            {step > 1 && (
                <Button 
                    className="gap-2" 
                    variant="outline"
                    onClick={() => setStep(step-1)}
                >
                    <ArrowLeft className="w-4 h-4"/>
                    Back
                </Button>
            )}
          <Button
            className={"flex-1 gap-2"}
            disabled={isLoading}
            onClick={handleNext}
          >
            {isLoading
              ? "Completing..."
              : step == 2
                ? "Complete Setup"
                : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
