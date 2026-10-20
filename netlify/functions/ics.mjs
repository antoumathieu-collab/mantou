import { getStore } from "@netlify/blobs";
import { handleIcsUpload } from "./lib/core.mjs";
export default async (req) => handleIcsUpload(req, process.env, getStore("prepa"));
export const config = { path: "/api/ics" };
