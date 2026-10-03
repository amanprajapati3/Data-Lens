"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTargetUrl = validateTargetUrl;
const promises_1 = __importDefault(require("node:dns/promises"));
const node_net_1 = __importDefault(require("node:net"));
const BLOCKED_HOSTNAMES = new Set([
    "localhost",
    "localhost.localdomain",
]);
function isPrivateIPv4(ip) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(Number.isNaN)) {
        return false;
    }
    const [a, b] = parts;
    return (a === 10 ||
        a === 127 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a === 0);
}
function isPrivateIPv6(ip) {
    const normalized = ip.toLowerCase();
    return (normalized === "::1" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe80:"));
}
async function validateTargetUrl(input) {
    let url;
    try {
        url = new URL(input);
    }
    catch {
        throw new Error("Invalid URL");
    }
    if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are allowed");
    }
    if (url.username || url.password) {
        throw new Error("URLs containing credentials are not allowed");
    }
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.has(hostname)) {
        throw new Error("This hostname is not allowed");
    }
    if (node_net_1.default.isIP(hostname)) {
        if (isPrivateIPv4(hostname) ||
            isPrivateIPv6(hostname)) {
            throw new Error("Private IP addresses are not allowed");
        }
        return url;
    }
    const addresses = await promises_1.default.lookup(hostname, {
        all: true,
    });
    for (const address of addresses) {
        if (isPrivateIPv4(address.address) ||
            isPrivateIPv6(address.address)) {
            throw new Error("Target resolves to a private IP");
        }
    }
    return url;
}
