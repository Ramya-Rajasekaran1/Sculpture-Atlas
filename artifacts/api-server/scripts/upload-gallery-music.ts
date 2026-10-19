import { resolve } from "node:path";
import { objectStorageClient, ObjectStorageService } from "../src/lib/objectStorage";

const input = process.argv[2];
if (!input) throw new Error("Pass the prepared instrumental MP3 file path.");
const publicPath = new ObjectStorageService().getPublicObjectSearchPaths()[0];
const [bucketName, ...prefix] = publicPath.replace(/^\/+/, "").split("/");
if (!bucketName) throw new Error("Public storage location is missing.");
const destination = [...prefix, "audio/thillana-instrumental.mp3"].join("/");
await objectStorageClient.bucket(bucketName).upload(resolve(input), {
  destination,
  resumable: false,
  metadata: { contentType: "audio/mpeg", cacheControl: "public, max-age=86400" },
});
console.info("Uploaded original instrumental track to gallery public asset storage.");
