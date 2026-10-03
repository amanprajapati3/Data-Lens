import { validateTargetUrl } from "./url-validator";

async function test() {
  const urls = [
    "https://example.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.1",
    "ftp://example.com",
    "file:///etc/passwd",
  ];

  for (const input of urls) {
    try {
      const result = await validateTargetUrl(input);

      console.log(
        `ALLOWED: ${input} → ${result.href}`
      );
    } catch (error) {
      console.log(
        `BLOCKED: ${input} → ${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }`
      );
    }
  }
}

test();