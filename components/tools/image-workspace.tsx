"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Download,
  FolderOpen,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import type { Tool } from "@/lib/tools/catalog";
import { imageAction } from "@/lib/tools/presentation";

export function ImageWorkspace({ tool }: { tool: Tool }) {
  const bitmap = useRef<ImageBitmap | null>(null);
  const urls = useRef<string[]>([]);
  const generation = useRef(0);
  const settingsRevision = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const sourceUrl = useRef<string | null>(null);
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [original, setOriginal] = useState<{
    name: string;
    width: number;
    height: number;
    size: number;
    url: string;
  } | null>(null);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [lock, setLock] = useState(true);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [angle, setAngle] = useState("90");
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("image/webp");
  const [output, setOutput] = useState<{
    url: string;
    size: number;
    width: number;
    height: number;
    type: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(
    () => () => {
      generation.current++;
      bitmap.current?.close();
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );
  function clearOutput() {
    settingsRevision.current++;
    if (output) {
      URL.revokeObjectURL(output.url);
      urls.current = urls.current.filter((url) => url !== output.url);
    }
    setOutput(null);
    setError("");
  }
  async function load(file?: File) {
    const current = ++generation.current;
    clearOutput();
    bitmap.current?.close();
    bitmap.current = null;
    if (sourceUrl.current) {
      URL.revokeObjectURL(sourceUrl.current);
      urls.current = urls.current.filter((url) => url !== sourceUrl.current);
      sourceUrl.current = null;
    }
    setOriginal(null);
    setDragging(false);
    if (!file) {
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !file.size ||
      file.size > 20 * 1024 * 1024
    ) {
      setError("Choose a nonempty JPG, PNG or WebP image up to 20 MiB.");
      return;
    }
    if (
      (tool.slug === "jpg-to-png-converter" && file.type !== "image/jpeg") ||
      (tool.slug === "webp-to-png-converter" && file.type !== "image/webp")
    ) {
      setError("Choose the source format named by this converter.");
      return;
    }
    setBusy(true);
    try {
      const image = await createImageBitmap(file);
      if (current !== generation.current) {
        image.close();
        return;
      }
      if (
        image.width * image.height > 16000000 ||
        image.width > 8000 ||
        image.height > 8000
      ) {
        image.close();
        throw new Error(
          "Images are limited to 16 megapixels and 8,000 pixels per side.",
        );
      }
      bitmap.current = image;
      const previewUrl = URL.createObjectURL(file);
      sourceUrl.current = previewUrl;
      urls.current.push(previewUrl);
      setOriginal({
        name: file.name,
        width: image.width,
        height: image.height,
        size: file.size,
        url: previewUrl,
      });
      setWidth(image.width);
      setHeight(image.height);
      setX(0);
      setY(0);
    } catch (failure) {
      if (current === generation.current)
        setError(
          failure instanceof Error
            ? failure.message
            : "This browser could not decode the image.",
        );
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }
  async function process(event: React.FormEvent) {
    event.preventDefault();
    clearOutput();
    const image = bitmap.current;
    if (!image) {
      setError("Choose an image first.");
      return;
    }
    const current = generation.current;
    const currentSettings = settingsRevision.current;
    setBusy(true);
    try {
      let targetWidth = image.width;
      let targetHeight = image.height;
      if (["resize-image", "crop-image"].includes(tool.slug)) {
        if (
          ![width, height, x, y].every(Number.isSafeInteger) ||
          width < 1 ||
          height < 1 ||
          width > 8000 ||
          height > 8000 ||
          width * height > 16000000
        )
          throw new Error(
            "Use whole-pixel dimensions, at most 8,000 per side and 16 megapixels.",
          );
        targetWidth = width;
        targetHeight = height;
      }
      if (
        tool.slug === "crop-image" &&
        (x < 0 || y < 0 || x + width > image.width || y + height > image.height)
      )
        throw new Error(
          "The crop rectangle must stay inside the original image.",
        );
      const rotation = tool.slug === "rotate-image" ? Number(angle) : 0;
      if (rotation === 90 || rotation === 270)
        [targetWidth, targetHeight] = [targetHeight, targetWidth];
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable in this browser.");
      let type =
        tool.slug === "image-to-webp-converter"
          ? "image/webp"
          : tool.slug === "compress-image"
            ? format
            : "image/png";
      if (type === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, targetWidth, targetHeight);
      }
      if (tool.slug === "image-to-black-and-white")
        context.filter = "grayscale(1)";
      if (rotation) {
        context.translate(targetWidth / 2, targetHeight / 2);
        context.rotate((rotation * Math.PI) / 180);
        context.drawImage(image, -image.width / 2, -image.height / 2);
      } else if (tool.slug === "crop-image")
        context.drawImage(image, x, y, width, height, 0, 0, width, height);
      else context.drawImage(image, 0, 0, targetWidth, targetHeight);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, quality / 100),
      );
      if (!blob || blob.type !== type)
        throw new Error(
          "This browser cannot encode the chosen format. Try a current browser or another format.",
        );
      if (
        current !== generation.current ||
        currentSettings !== settingsRevision.current
      )
        return;
      type = blob.type;
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      setOutput({
        url,
        size: blob.size,
        width: targetWidth,
        height: targetHeight,
        type,
      });
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Image conversion failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  function dimension(value: number, key: "width" | "height") {
    clearOutput();
    if (key === "width") {
      setWidth(value);
      if (lock && original && tool.slug === "resize-image")
        setHeight(Math.round((value * original.height) / original.width));
    } else {
      setHeight(value);
      if (lock && original && tool.slug === "resize-image")
        setWidth(Math.round((value * original.width) / original.height));
    }
  }
  return (
    <section
      className="reference-card tool-workspace"
      aria-label={`${tool.title} workspace`}
    >
      <form onSubmit={process} className="tool-form">
        <div
          className={`tools-dropzone${dragging ? " is-dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragLeave={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!busy) void load(event.dataTransfer.files[0]);
          }}
        >
          <span className="tools-upload-symbol">
            <Upload size={37} aria-hidden="true" />
          </span>
          <div className="tools-dropzone-copy">
            <h2>{original ? "Your image is ready" : "Choose your image"}</h2>
            <p>
              {original
                ? original.name
                : `Drag and drop ${tool.slug === "jpg-to-png-converter" ? "a JPG" : tool.slug === "webp-to-png-converter" ? "a WebP" : "an image"} file here, or click to browse`}
            </p>
            <small>
              {original
                ? `${original.width} × ${original.height} px · ${(original.size / 1024).toFixed(1)} KiB`
                : `${tool.slug === "jpg-to-png-converter" ? "JPG" : tool.slug === "webp-to-png-converter" ? "WebP" : "JPG, PNG or WebP"} · Maximum size: 20 MiB`}
            </small>
            <button
              className="button button-primary"
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
            >
              <FolderOpen size={18} aria-hidden="true" />
              {original ? "Change file" : "Choose file"}
            </button>
          </div>
          {original ? (
            <div className="tools-source-preview">
              {/* eslint-disable-next-line @next/next/no-img-element -- Selected local image uses an object URL. */}
              <img
                src={original.url}
                alt="Your original image"
                width={original.width}
                height={original.height}
              />
              <span>Original image</span>
            </div>
          ) : tool.slug === "jpg-to-png-converter" ? (
            <div className="tools-image-examples" aria-hidden="true">
              <Image
                src="/tools/09_jpg_preview.png"
                width={240}
                height={185}
                alt=""
                sizes="170px"
              />
              <span className="tools-preview-arrow">
                <ArrowRight size={20} />
              </span>
              <Image
                src="/tools/10_png_preview.png"
                width={240}
                height={185}
                alt=""
                sizes="170px"
              />
            </div>
          ) : (
            <div className="tools-image-examples" aria-hidden="true">
              <Image
                src="/tools/02_tools_document_illustration.png"
                width={395}
                height={335}
                alt=""
                sizes="220px"
                className="tools-upload-art"
              />
            </div>
          )}
        </div>
        <label className="sr-only" htmlFor={inputId}>
          Image file · maximum 20 MiB
        </label>
        <input
          id={inputId}
          ref={fileInput}
          className="sr-only"
          type="file"
          accept={
            tool.slug === "jpg-to-png-converter"
              ? "image/jpeg"
              : tool.slug === "webp-to-png-converter"
                ? "image/webp"
                : "image/jpeg,image/png,image/webp"
          }
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void load(file);
          }}
        />
        {["resize-image", "crop-image"].includes(tool.slug) && (
          <div className="tool-field-row">
            <label>
              Width (pixels)
              <input
                type="number"
                required
                min="1"
                max="8000"
                step="1"
                value={width}
                onChange={(event) =>
                  dimension(Number(event.target.value), "width")
                }
              />
            </label>
            <label>
              Height (pixels)
              <input
                type="number"
                required
                min="1"
                max="8000"
                step="1"
                value={height}
                onChange={(event) =>
                  dimension(Number(event.target.value), "height")
                }
              />
            </label>
          </div>
        )}
        {tool.slug === "resize-image" && (
          <label className="tool-checkbox">
            <input
              type="checkbox"
              checked={lock}
              onChange={(event) => setLock(event.target.checked)}
            />
            Keep aspect ratio when changing dimensions
          </label>
        )}
        {tool.slug === "crop-image" && (
          <div className="tool-field-row">
            <label>
              Left offset (pixels)
              <input
                type="number"
                min="0"
                required
                value={x}
                onChange={(event) => {
                  clearOutput();
                  setX(Number(event.target.value));
                }}
              />
            </label>
            <label>
              Top offset (pixels)
              <input
                type="number"
                min="0"
                required
                value={y}
                onChange={(event) => {
                  clearOutput();
                  setY(Number(event.target.value));
                }}
              />
            </label>
          </div>
        )}
        {tool.slug === "rotate-image" && (
          <label>
            Clockwise rotation
            <select
              value={angle}
              onChange={(event) => {
                clearOutput();
                setAngle(event.target.value);
              }}
            >
              {[90, 180, 270].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        )}
        {tool.slug === "compress-image" && (
          <label>
            Output format
            <select
              value={format}
              onChange={(event) => {
                clearOutput();
                setFormat(event.target.value);
              }}
            >
              <option value="image/webp">WebP</option>
              <option value="image/jpeg">
                JPEG · transparent pixels become white
              </option>
            </select>
          </label>
        )}
        {["compress-image", "image-to-webp-converter"].includes(tool.slug) && (
          <label>
            Quality · {quality}%
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(event) => {
                clearOutput();
                setQuality(Number(event.target.value));
              }}
            />
          </label>
        )}
        <div className="reference-actions">
          <button
            className="button button-primary"
            disabled={!original || busy}
          >
            <RefreshCw size={17} aria-hidden="true" />
            {busy ? "Processing…" : imageAction(tool.slug)}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="button button-secondary"
            disabled={busy}
            onClick={() => {
              void load();
              if (fileInput.current) fileInput.current.value = "";
            }}
          >
            <Trash2 size={17} aria-hidden="true" />
            Clear image
          </button>
        </div>
      </form>
      {error && (
        <p role="alert" className="tool-error">
          {error}
        </p>
      )}
      <p role="status">
        {output
          ? `Image ready: ${output.width} × ${output.height} pixels; ${(output.size / 1024).toFixed(1)} KiB. ${original && output.size >= original.size ? "Output is not smaller than the original." : original ? `${((1 - output.size / original.size) * 100).toFixed(1)}% smaller than the original.` : ""}`
          : ""}
      </p>
      {output && (
        <div className="tool-image-result">
          {/* eslint-disable-next-line @next/next/no-img-element -- Local blob preview, not a remotely optimizable asset. */}
          <img
            src={output.url}
            width={output.width}
            height={output.height}
            alt="Your processed image"
          />
          <a
            className="button button-primary"
            href={output.url}
            download={`${
              original?.name
                .replace(/\.[^.]+$/, " ")
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "-") || "image"
            }-${tool.slug}.${output.type === "image/webp" ? "webp" : output.type === "image/jpeg" ? "jpg" : "png"}`}
          >
            <Download size={17} aria-hidden="true" />
            Download image
          </a>
        </div>
      )}
      <div className="tool-privacy">
        <ShieldCheck
          className="tools-privacy-icon"
          size={29}
          aria-hidden="true"
        />
        <strong>Your image stays on your device.</strong>
        <p>
          Conversions use this browser, not our server. Animated files become a
          single still image. Re-encoding may remove metadata and alter color;
          compare the result before using it. A higher quality setting does not
          guarantee a smaller file.
        </p>
      </div>
    </section>
  );
}
