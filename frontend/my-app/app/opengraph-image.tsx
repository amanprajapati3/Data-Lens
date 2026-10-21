import { ImageResponse } from "next/og";

export const alt = "Data Lens — practical website, data, image, and PDF tools";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #09090b 0%, #18181b 55%, #064e3b 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: "28px",
            color: "#6ee7b7",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Data Lens
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: "960px",
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.08,
          }}
        >
          Practical tools for data and files
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "28px",
            color: "#d4d4d8",
            fontSize: 28,
          }}
        >
          Extract · Convert · Edit · Compress
        </div>
      </div>
    ),
    size,
  );
}
