import crypto from "crypto";
import fs from "fs";
import path from "path";

import { WebsiteData } from "../types/crawler.types";

interface JobRecord {
  data: WebsiteData;
  createdAt: number;
  expiresAt: number;
}

/*
 * Jobs are cached on disk instead of only in memory so that a server
 * restart (for example the automatic reload triggered by "tsx watch"
 * whenever a source file changes) does not throw away every crawl
 * result and turn valid export URLs into 404 responses.
 */
const JOB_DIR = path.join(__dirname, "..", "..", ".data", "jobs");

// Jobs automatically expire after 24 hours.
const JOB_TTL = 24 * 60 * 60 * 1000;

function ensureJobDir(): void {
  fs.mkdirSync(JOB_DIR, { recursive: true });
}

function jobFilePath(jobId: string): string {
  /*
   * Job IDs are generated hex strings, but validate anyway so a crafted
   * ID can never escape the job directory.
   */
  if (!/^[a-f0-9]+$/.test(jobId)) {
    throw new Error("Invalid job ID");
  }

  return path.join(JOB_DIR, `${jobId}.json`);
}

/*
 * Load every still-valid job from disk into memory.
 * Called once at startup.
 */
function loadJobs(): Map<string, JobRecord> {
  const jobs = new Map<string, JobRecord>();

  if (!fs.existsSync(JOB_DIR)) {
    return jobs;
  }

  const now = Date.now();

  for (const entry of fs.readdirSync(JOB_DIR)) {
    if (!entry.endsWith(".json")) {
      continue;
    }

    const file = path.join(JOB_DIR, entry);

    try {
      const record = JSON.parse(
        fs.readFileSync(file, "utf8")
      ) as JobRecord;

      if (typeof record?.expiresAt !== "number") {
        continue;
      }

      if (now > record.expiresAt) {
        fs.unlinkSync(file);
        continue;
      }

      jobs.set(entry.replace(/\.json$/, ""), record);
    } catch {
      // Ignore unreadable or partially written job files.
      try {
        fs.unlinkSync(file);
      } catch {
        // Ignore.
      }
    }
  }

  return jobs;
}

const jobs: Map<string, JobRecord> = loadJobs();

/**
 * Create a secure random job ID.
 */
function generateJobId(): string {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * Store crawl result and return job ID.
 */
export function createJob(data: WebsiteData): string {
  const jobId = generateJobId();

  const now = Date.now();

  const record: JobRecord = {
    data,
    createdAt: now,
    expiresAt: now + JOB_TTL,
  };

  jobs.set(jobId, record);

  ensureJobDir();

  fs.writeFileSync(
    jobFilePath(jobId),
    JSON.stringify(record),
    "utf8"
  );

  return jobId;
}

/**
 * Retrieve a stored job.
 */
export function getJob(jobId: string): WebsiteData | null {
  const job = jobs.get(jobId);

  if (job) {
    /*
     * Remove expired jobs.
     */
    if (Date.now() > job.expiresAt) {
      deleteJob(jobId);

      return null;
    }

    return job.data;
  }

  /*
   * Fall back to disk. This covers the case where the job was written by
   * a previous process and the in-memory copy was lost.
   */
  if (!/^[a-f0-9]+$/.test(jobId)) {
    return null;
  }

  try {
    const file = jobFilePath(jobId);

    if (!fs.existsSync(file)) {
      return null;
    }

    const record = JSON.parse(
      fs.readFileSync(file, "utf8")
    ) as JobRecord;

    if (typeof record?.expiresAt !== "number") {
      return null;
    }

    if (Date.now() > record.expiresAt) {
      deleteJob(jobId);

      return null;
    }

    jobs.set(jobId, record);

    return record.data;
  } catch {
    return null;
  }
}

/**
 * Delete a job manually.
 */
export function deleteJob(jobId: string): boolean {
  jobs.delete(jobId);

  try {
    const file = jobFilePath(jobId);

    if (fs.existsSync(file)) {
      fs.unlinkSync(file);

      return true;
    }
  } catch {
    // Ignore filesystem errors.
  }

  return false;
}

/**
 * Remove all expired jobs.
 */
export function cleanupExpiredJobs(): void {
  const now = Date.now();

  for (const [jobId, job] of jobs.entries()) {
    if (now > job.expiresAt) {
      deleteJob(jobId);
    }
  }

  if (fs.existsSync(JOB_DIR)) {
    for (const entry of fs.readdirSync(JOB_DIR)) {
      if (!entry.endsWith(".json")) {
        continue;
      }

      const file = path.join(JOB_DIR, entry);

      try {
        const record = JSON.parse(
          fs.readFileSync(file, "utf8")
        ) as JobRecord;

        if (typeof record?.expiresAt !== "number" || now > record.expiresAt) {
          fs.unlinkSync(file);
        }
      } catch {
        try {
          fs.unlinkSync(file);
        } catch {
          // Ignore.
        }
      }
    }
  }
}

/**
 * Return the number of
 * currently stored jobs.
 */
export function getJobCount(): number {
  cleanupExpiredJobs();

  return jobs.size;
}

/*
 * Run cleanup every 30 minutes.
 */
setInterval(cleanupExpiredJobs, 30 * 60 * 1000);
