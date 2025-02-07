import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-02-07",
  useCdn: false, // must be false when using a token
  token: process.env.SANITY_API_TOKEN, // Make sure this token has delete permissions
});
