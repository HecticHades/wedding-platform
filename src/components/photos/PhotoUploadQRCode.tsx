"use client";

import { useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getPhotoUploadUrl } from "@/lib/photos/photo-utils";
import { Download, Printer, Copy, Check } from "lucide-react";
import { useState } from "react";

interface PhotoUploadQRCodeProps {
  subdomain: string;
  baseUrl: string;
}

/**
 * QR code component for guest photo uploads
 * Includes download and print functionality
 */
export function PhotoUploadQRCode({ subdomain, baseUrl }: PhotoUploadQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const uploadUrl = getPhotoUploadUrl(subdomain, baseUrl);

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Create a canvas to render the SVG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (larger for better quality)
    const size = 400;
    canvas.width = size;
    canvas.height = size + 60; // Extra space for text

    // Draw white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Draw the QR code centered
      const qrSize = 350;
      const xOffset = (size - qrSize) / 2;
      ctx.drawImage(img, xOffset, 20, qrSize, qrSize);

      // Add caption
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#374151";
      ctx.textAlign = "center";
      ctx.fillText("Scan to share your photos", size / 2, size + 40);

      // Download
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `wedding-photo-upload-qr-${subdomain}.png`;
      downloadLink.click();

      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  }, [subdomain]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Photo Upload QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
            }
            svg {
              width: 300px;
              height: 300px;
            }
            .caption {
              margin-top: 20px;
              font-size: 18px;
              color: #374151;
            }
            .url {
              margin-top: 10px;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${qrRef.current?.innerHTML || ""}
            <p class="caption">Scan to share your photos</p>
            <p class="url">${uploadUrl}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }, [uploadUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(uploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [uploadUrl]);

  return (
    <div className="flex flex-col items-center">
      {/* QR Code */}
      <div
        ref={qrRef}
        className="bg-white p-4 rounded-lg border border-gray-200 mb-4"
      >
        <QRCodeSVG
          value={uploadUrl}
          size={200}
          level="M"
          includeMargin
          className="mx-auto"
        />
      </div>

      {/* Caption */}
      <p className="text-sm text-gray-600 mb-4">Scan to share your photos</p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* Usage tips */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Print this QR code and display it at your venue, or share the link
          directly with guests.
        </p>
      </div>
    </div>
  );
}
