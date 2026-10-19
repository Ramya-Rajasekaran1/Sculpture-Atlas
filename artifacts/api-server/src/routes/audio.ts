import { Router, type IRouter } from "express";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const storage = new ObjectStorageService();

// Fixed public asset only: no user-upload endpoint or arbitrary object access.
router.get("/audio/thillana.mp3", async (req, res) => {
  try {
    const file = await storage.searchPublicObject("audio/thillana-instrumental.mp3");
    if (!file) {
      res.status(404).json({ error: "Background music is unavailable." });
      return;
    }
    const [metadata] = await file.getMetadata();
    const size = Number(metadata.size);
    if (!Number.isSafeInteger(size) || size < 1) {
      throw new Error("Audio asset has invalid size");
    }
    let start = 0;
    let end = size - 1;
    const range = req.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (match && (match[1] || match[2])) {
        if (match[1]) {
          start = Number(match[1]);
          end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
        } else {
          start = Math.max(0, size - Number(match[2]));
        }
      } else {
        start = size;
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)
        || start >= size || start > end) {
        res.status(416).set("Content-Range", `bytes */${size}`).end();
        return;
      }
      res.status(206).set("Content-Range", `bytes ${start}-${end}/${size}`);
    }
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    const stream = file.createReadStream({ start, end });
    res.on("close", () => stream.destroy());
    stream.on("error", (error) => {
      req.log.error({ err: error }, "Background music stream failed");
      if (!res.headersSent) {
        res.removeHeader("Content-Length");
        res.removeHeader("Content-Range");
        res.removeHeader("Content-Type");
        res.status(503).json({ error: "Background music is temporarily unavailable." });
      } else {
        res.destroy(error);
      }
    });
    stream.pipe(res);
  } catch (error) {
    req.log.error({ err: error }, "Could not load background music");
    res.status(503).json({ error: "Background music is temporarily unavailable." });
  }
});

export default router;
