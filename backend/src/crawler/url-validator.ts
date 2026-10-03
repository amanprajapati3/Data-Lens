import dns from "node:dns/promises";
import net from "node:net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 0
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

export async function validateTargetUrl(
  input: string
): Promise<URL> {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
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

  if (net.isIP(hostname)) {
    if (
      isPrivateIPv4(hostname) ||
      isPrivateIPv6(hostname)
    ) {
      throw new Error("Private IP addresses are not allowed");
    }

    return url;
  }

  const addresses = await dns.lookup(hostname, {
    all: true,
  });

  for (const address of addresses) {
    if (
      isPrivateIPv4(address.address) ||
      isPrivateIPv6(address.address)
    ) {
      throw new Error("Target resolves to a private IP");
    }
  }

  return url;
}