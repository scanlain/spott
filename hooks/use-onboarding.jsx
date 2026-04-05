"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useConvexQuery } from "./use-convex-query"
import { api } from "@/convex/_generated/api"

const ATTENDEE_PAGES = ["/explore", "/events", "/my-tickets"]

export function useOnboarding(){

    const [showOnboarding, setShowOnboarding] = useState(false)

    const pathName = usePathname();
    const router = useRouter();

    const { data: currentUser, isLoading } = useConvexQuery(api.users.getCurrentUser);

    useEffect(() => {

        if(!currentUser || isLoading) return;

        if(!currentUser.hasCompletedOnboarding){

            const requiresOnboarding = ATTENDEE_PAGES.some((page) => pathName.startsWith(page));

            if(requiresOnboarding){
                //eslint-disable-next-line react-hooks/set-state-in-effect
                setShowOnboarding(true);
            }
        }
    }, [currentUser, pathName, isLoading])

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        router.refresh()
    };

    const handleOnboardingSkip = () => {
        setShowOnboarding(false);
        router.push("/");
    }

    return {
        showOnboarding,
        handleOnboardingComplete,
        handleOnboardingSkip,
        setShowOnboarding,
        needsOnboarding: currentUser && !currentUser.hasCompletedOnboarding,
    }
}