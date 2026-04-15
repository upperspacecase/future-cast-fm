#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const ACCOUNT_PUBLIC_URL = "https://pub-40079986b4d44b64b088888ced37239e.r2.dev";
const SOCIALS_DIR = "/Users/taypattison/Documents/futurecast.fm_socials";

function keychainGet(service) {
  return execSync(
    `security find-generic-password -a "$USER" -s ${JSON.stringify(service)} -w`,
    { encoding: "utf8" }
  ).trim();
}

function parseFilename(name) {
  const m = name.match(/^(\d{4})\s*-\s*riverside_(.+?)_future_cast\.mp4$/);
  if (!m) return null;
  const episodeNumber = m[1];
  const topicRaw = m[2];
  const slug = topicRaw
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
  const topic = topicRaw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { episodeNumber, topic, slug };
}

const ClipSchema = new mongoose.Schema(
  {
    episodeNumber: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    filename: { type: String, required: true },
    r2Key: { type: String, required: true, unique: true },
    publicUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "queued", "posted", "failed"],
      default: "pending",
      index: true,
    },
    bufferPostId: String,
    scheduledAt: Date,
    postedAt: Date,
    errorMessage: String,
  },
  { timestamps: true }
);
ClipSchema.index({ status: 1, createdAt: 1 });

const Clip = mongoose.models.Clip || mongoose.model("Clip", ClipSchema);

async function main() {
  const uri = keychainGet("futurecast-mongodb-uri");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const files = fs
    .readdirSync(SOCIALS_DIR)
    .filter((f) => f.endsWith(".mp4"))
    .sort();

  let inserted = 0;
  let skipped = 0;

  for (const filename of files) {
    const parsed = parseFilename(filename);
    if (!parsed) {
      console.log(`SKIP (unparseable): ${filename}`);
      continue;
    }
    const { episodeNumber, topic, slug } = parsed;
    const r2Key = `${episodeNumber}/${slug}.mp4`;
    const publicUrl = `${ACCOUNT_PUBLIC_URL}/${r2Key}`;
    const stat = fs.statSync(path.join(SOCIALS_DIR, filename));

    const existing = await Clip.findOne({ r2Key });
    if (existing) {
      console.log(`SKIP (exists): ${r2Key}`);
      skipped += 1;
      continue;
    }

    await Clip.create({
      episodeNumber,
      topic,
      filename,
      r2Key,
      publicUrl,
      status: "pending",
      createdAt: stat.mtime,
    });
    console.log(`INSERT: ${r2Key}`);
    inserted += 1;
  }

  console.log(`\nDone. inserted=${inserted} skipped=${skipped}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
