import { getStore } from "@netlify/blobs";
import { handleWell } from "./lib/core.mjs";
export default async (req) => handleWell(req, process.env, getStore("prepa"));
export const config = { path: "/api/well" };
