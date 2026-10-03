"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJob = getJob;
exports.deleteJob = deleteJob;
exports.cleanupExpiredJobs = cleanupExpiredJobs;
exports.getJobCount = getJobCount;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/*
 * Jobs are cached on disk instead of only in memory so that a server
 * restart (for example the automatic reload triggered by "tsx watch"
 * whenever a source file changes) does not throw away every crawl
 * result and turn valid export URLs into 404 responses.
 */
const JOB_DIR = path_1.default.join(__dirname, "..", "..", ".data", "jobs");
// Jobs automatically expire after 24 hours.
const JOB_TTL = 24 * 60 * 60 * 1000;
function ensureJobDir() {
    fs_1.default.mkdirSync(JOB_DIR, { recursive: true });
}
function jobFilePath(jobId) {
    /*
     * Job IDs are generated hex strings, but validate anyway so a crafted
     * ID can never escape the job directory.
     */
    if (!/^[a-f0-9]+$/.test(jobId)) {
        throw new Error("Invalid job ID");
    }
    return path_1.default.join(JOB_DIR, `${jobId}.json`);
}
/*
 * Load every still-valid job from disk into memory.
 * Called once at startup.
 */
function loadJobs() {
    const jobs = new Map();
    if (!fs_1.default.existsSync(JOB_DIR)) {
        return jobs;
    }
    const now = Date.now();
    for (const entry of fs_1.default.readdirSync(JOB_DIR)) {
        if (!entry.endsWith(".json")) {
            continue;
        }
        const file = path_1.default.join(JOB_DIR, entry);
        try {
            const record = JSON.parse(fs_1.default.readFileSync(file, "utf8"));
            if (typeof record?.expiresAt !== "number") {
                continue;
            }
            if (now > record.expiresAt) {
                fs_1.default.unlinkSync(file);
                continue;
            }
            jobs.set(entry.replace(/\.json$/, ""), record);
        }
        catch {
            // Ignore unreadable or partially written job files.
            try {
                fs_1.default.unlinkSync(file);
            }
            catch {
                // Ignore.
            }
        }
    }
    return jobs;
}
const jobs = loadJobs();
/**
 * Create a secure random job ID.
 */
function generateJobId() {
    return crypto_1.default.randomBytes(24).toString("hex");
}
/**
 * Store crawl result and return job ID.
 */
function createJob(data) {
    const jobId = generateJobId();
    const now = Date.now();
    const record = {
        data,
        createdAt: now,
        expiresAt: now + JOB_TTL,
    };
    jobs.set(jobId, record);
    ensureJobDir();
    fs_1.default.writeFileSync(jobFilePath(jobId), JSON.stringify(record), "utf8");
    return jobId;
}
/**
 * Retrieve a stored job.
 */
function getJob(jobId) {
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
        if (!fs_1.default.existsSync(file)) {
            return null;
        }
        const record = JSON.parse(fs_1.default.readFileSync(file, "utf8"));
        if (typeof record?.expiresAt !== "number") {
            return null;
        }
        if (Date.now() > record.expiresAt) {
            deleteJob(jobId);
            return null;
        }
        jobs.set(jobId, record);
        return record.data;
    }
    catch {
        return null;
    }
}
/**
 * Delete a job manually.
 */
function deleteJob(jobId) {
    jobs.delete(jobId);
    try {
        const file = jobFilePath(jobId);
        if (fs_1.default.existsSync(file)) {
            fs_1.default.unlinkSync(file);
            return true;
        }
    }
    catch {
        // Ignore filesystem errors.
    }
    return false;
}
/**
 * Remove all expired jobs.
 */
function cleanupExpiredJobs() {
    const now = Date.now();
    for (const [jobId, job] of jobs.entries()) {
        if (now > job.expiresAt) {
            deleteJob(jobId);
        }
    }
    if (fs_1.default.existsSync(JOB_DIR)) {
        for (const entry of fs_1.default.readdirSync(JOB_DIR)) {
            if (!entry.endsWith(".json")) {
                continue;
            }
            const file = path_1.default.join(JOB_DIR, entry);
            try {
                const record = JSON.parse(fs_1.default.readFileSync(file, "utf8"));
                if (typeof record?.expiresAt !== "number" || now > record.expiresAt) {
                    fs_1.default.unlinkSync(file);
                }
            }
            catch {
                try {
                    fs_1.default.unlinkSync(file);
                }
                catch {
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
function getJobCount() {
    cleanupExpiredJobs();
    return jobs.size;
}
/*
 * Run cleanup every 30 minutes.
 */
setInterval(cleanupExpiredJobs, 30 * 60 * 1000);
