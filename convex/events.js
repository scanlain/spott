import { internal } from "./_generated/api";

const { v } = require("convex/values");
const { mutation, query } = require("./_generated/server");

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),

    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),

    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),

    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    hasPro: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    try {
      const user = await ctx.runQuery(internal.users.getCurrentUser);

      if (!hasPro && user.freeEventsCreated >= 1) {
        throw new Error(
          "Free event limit reached. Please upgrade to Pro to create more events.",
        );
      }

      const defaultColor = "#1e3a8a";
      if (!hasPro && args.themeColor && args.themeColor !== defaultColor) {
        throw new Error(
          "Custom theme color are a Pro feature. Please upgrade to Pro.",
        );
      }

      const themeColor = hasPro ? args.themeColor : defaultColor;

      const slug = args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

        const eventId = await ctx.db.insert("events", {
            ...args,
            themeColor,
            slug: `${slug}-${Date.now()}`,
            organizerId: user._id,
            organizerName: user.name,
            registrationCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })

        //Update user's free event count
        await ctx.db.patch(user._id, {
            freeEventsCreated: user.freeEventsCreated + 1,
        });

        return eventId;

    } catch (error) {

        throw new Error(`Failed to create event: ${error.message}`)

    }
  },
});

//Get event by slug
export const getEventBySlug = query({
    args: {slug: v.string() },
    handler: async (ctx, args) => {

        const event = await ctx.db.query("events").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();

        return event;
    }
})

//Get events by organizer
export const getMyEvents = query({
    handler: async(ctx) => {
        const currentUser = await ctx.runQuery(internal.users.getCurrentUser)

        const events = await ctx.db.query("events")
                                    .withIndex("by_organizer", (q) => q.eq("organizer_id", currentUser._id))
                                    .order("desc")
                                    .collect();

        return events;
    }
})

//Delete event
export const deleteEvents = query({
    args: {eventId: v.id("events")},
    handler: async(ctx, args) => {

        const user = await ctx.runQuery(internal.users.getCurrentUser);

        const event = await ctx.db.get(args.eventId);

        if(!event){
            throw new Error("Event not found");
        }

        //Check is the user is the organizer
        if(event.organizerId !==  user._id){
            throw new Error("You are not authorized to delete this event");
        }

        //Delete all the registrations for this event
        const registrations = await ctx.db.query("registrations").withIndex('by_event', (q) => q.eq("eventId", args.eventId)).collect()

        for(const registration of registrations ){
            await ctx.db.delete(registration._id);
        }

        //Delete the event
        await ctx.db.delete(args.eventId);

        if(user.freeEventsCreated > 0){
            await ctx.db.patch(user._id, {
                freeEventsCreated: user.freeEventsCreated-1,
            });
        }

        return { success: true };
    }
})
