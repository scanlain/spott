import { City, State } from "country-state-city";
import { isValid } from "date-fns";

export function createLocationSlug(city, state){

    if(!city || !state) return "";

    const citySlug = city.toLowerCase().replace(/\s+/g, "-")
    const stateSlug = state.toLowerCase().replace(/\s+/g, "-")

    return `${citySlug}-${stateSlug}`;
}

export function parseLocationSlug(slug){

    if(!slug ||  typeof slug !== "string"){
        return { city: null, state: null, isValid: false}
    }

    const parts = slug.split("-")

    if(parts.length < 2){
        return { city: null, state: null, isValid: false}
    }

    const cityName = parts[0].charAt(0).toLowerCase() + parts[0].slice(1)

    const stateName = parts.slice(1).map((p) => p.charAt(0).toLowerCase() + p.slice(1)).join("")

    //Get all Indian states
    const indianStates = State.getStatesOfCountry("IN")

    //Validate state
    const stateObj = indianStates.find((s) => s.name.toLowerCase() === stateName.toLowerCase())

    if(!stateObj){
        return {city: null, state: null, isValid: false};
    }

    //Get all Indian cities
    const indianCities = City.getCitiesOfState("IN", stateObj.isoCode)

    const cityExists = indianCities.some(c => c.name.toLowerCase() === cityName.toLowerCase())

    if(!cityExists){
        return { city: null, state: null, isValid: false}
    }

    return { city: cityName, state: stateName, isValid: true};
}