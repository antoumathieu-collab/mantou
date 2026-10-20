import { getStore } from "@netlify/blobs";
import { handlePlan } from "./lib/core.mjs";
export default async (req) => handlePlan(req, process.env, getStore("prepa"));
export const config = { path: "/plan.ics" };
