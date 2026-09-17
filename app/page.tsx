"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePicker } from "../packages/react/src/ImagePicker";
import { formatBytes, IMAGE_TYPES } from "../packages/react/src/validation";
import "../packages/react/src/styles.css";
import "../packages/react/src/details.css";
import "./playground.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Code2,
  Copy,
  Check,
  Download,
  SlidersHorizontal,
  LockKeyhole,
  RotateCcw,
  ArrowUpRight,
  MousePointer2,
  ScanEye,
  ShieldCheck,
} from "lucide-react";

const defaults = {
  multiple: true,
  maxFiles: 8,
  maxSize: 10,
  disabled: false,
  accent: "#3355df",
};
type Config = typeof defaults;
const packageUrl = "/downloads/aryansehgal-framepick-0.1.0.tgz";

function SelectField({
  label,
  value,
  values,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  values: number[];
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="setting-field">
      <label id={id}>{label}</label>
      <Select
        value={String(value)}
        onValueChange={(value) => onChange(Number(value))}
        disabled={disabled}
      >
        <SelectTrigger aria-labelledby={id} className="setting-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="setting-select-content">
          {values.map((number) => (
            <SelectItem key={number} value={String(number)}>
              {number}
              {label === "Max file size"
                ? " MB"
                : number === 1
                  ? " image"
                  : " images"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [config, setConfig] = useState(defaults);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState("playground");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [instance, setInstance] = useState(0);
  const state = useRef({ files, config });
  state.current = { files, config };
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const configure = (next: Partial<Config>) => {
    setConfig((current) => ({ ...current, ...next }));
    if (!("accent" in next) && !("disabled" in next)) {
      setFiles([]);
      setInstance((current) => current + 1);
      setBusy(false);
      setNotice("Settings updated. Selection reset.");
    }
  };
  const reset = () => {
    setConfig(defaults);
    setFiles([]);
    setInstance((current) => current + 1);
    setBusy(false);
    setNotice("Playground reset.");
  };
  const snippet = `import { useState } from "react";
import { ImagePicker } from "@aryansehgal/framepick";
import "@aryansehgal/framepick/style.css";

export function ImageInput() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <ImagePicker
      value={files}
      onValueChange={setFiles}
      multiple={${config.multiple}}
      maxFiles={${config.multiple ? config.maxFiles : 1}}
      maxSize={${config.maxSize} * 1024 * 1024}
      onReject={(errors) => console.log(errors)}
    />
  );
}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setNotice(
        "Clipboard unavailable. You can select and copy the code below.",
      );
    }
  }

  useEffect(() => {
    type Context = {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: object;
          execute: (input: unknown) => unknown;
        },
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools = [
      {
        name: "read_picker_selection",
        title: "Read selected image metadata",
        description:
          "Read the names, sizes and formats of images currently selected in this local playground. Does not read or transmit image bytes.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: (input: unknown) => {
          if (
            !input ||
            typeof input !== "object" ||
            Array.isArray(input) ||
            Object.keys(input).length
          )
            throw new Error("Expected an empty object.");
          return {
            files: state.current.files.map((file) => ({
              name: file.name,
              bytes: file.size,
              type: file.type,
            })),
            multiple: state.current.config.multiple,
          };
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {
        /* Optional API: the picker works without it. */
      }
    }
    return () => lifecycle.abort();
  }, []);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to playground
      </a>
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Framepick home">
          <span className="brand-mark" aria-hidden="true">
            f
          </span>
          framepick<span className="version">v0.1</span>
        </a>
        <nav aria-label="Main navigation">
          <button
            type="button"
            onClick={() => {
              setView("integration");
              document.getElementById("main")?.scrollIntoView();
            }}
          >
            Documentation
          </button>
          <a className="author-link" href="https://github.com/AryanSehgal">
            Aryan Sehgal <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main id="main">
        <div className="intro">
          <div>
            <p className="eyebrow">THE IMAGE PICKER, CONSIDERED.</p>
            <h1>
              A little component.
              <br />
              <span>A better first impression.</span>
            </h1>
            <p>Pick, preview, and make it yours. Built for the details.</p>
          </div>
          <a className="download-link" href={packageUrl} download>
            <Download size={16} /> Get the component
          </a>
        </div>
        <Tabs value={view} onValueChange={setView} className="workspace">
          <div className="workspace-bar">
            <TabsList variant="line" className="demo-tabs">
              <TabsTrigger value="playground">
                <MousePointer2 size={15} /> Playground
              </TabsTrigger>
              <TabsTrigger value="integration">
                <Code2 size={16} /> Integration
              </TabsTrigger>
            </TabsList>
            <span className="local-label">
              <LockKeyhole size={13} /> Files stay on your device
            </span>
          </div>
          <TabsContent
            value="playground"
            forceMount
            className="playground-panel"
            hidden={view !== "playground"}
          >
            <div className="workspace-body">
              <div
                className="picker-stage"
                style={
                  { "--demo-accent": config.accent } as React.CSSProperties
                }
              >
                <ImagePicker
                  key={instance}
                  value={files}
                  onValueChange={setFiles}
                  onBusyChange={setBusy}
                  multiple={config.multiple}
                  maxFiles={config.maxFiles}
                  maxSize={config.maxSize * 1024 ** 2}
                  disabled={config.disabled}
                  helperText="Only you can see these. Nothing is uploaded."
                />
                <div className="selection-summary">
                  <span>
                    {files.length
                      ? `${files.length} selected · ${formatBytes(files.reduce((sum, file) => sum + file.size, 0))} total`
                      : "A fresh canvas. Add your first image."}
                  </span>
                  <a href="/samples/color-study.png" download>
                    Need a test image? <Download size={12} />
                  </a>
                </div>
              </div>
              <aside className="settings" aria-label="Picker settings">
                <div className="settings-title">
                  <span>
                    <SlidersHorizontal size={15} /> Make it yours
                  </span>
                  <button
                    type="button"
                    className="reset-button"
                    aria-label="Reset playground"
                    onClick={reset}
                    disabled={busy}
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
                <div className="setting-row">
                  <div>
                    <label htmlFor="multiple">Multiple images</label>
                    <p>Make room for a collection.</p>
                  </div>
                  <Switch
                    id="multiple"
                    checked={config.multiple}
                    onCheckedChange={(value) => configure({ multiple: value })}
                    disabled={busy}
                    className="demo-switch"
                  />
                </div>
                <SelectField
                  label="Max images"
                  value={config.multiple ? config.maxFiles : 1}
                  values={config.multiple ? [3, 5, 8, 12] : [1]}
                  disabled={busy || !config.multiple}
                  onChange={(value) => configure({ maxFiles: value })}
                />
                <SelectField
                  label="Max file size"
                  value={config.maxSize}
                  values={[1, 5, 10, 20]}
                  disabled={busy}
                  onChange={(value) => configure({ maxSize: value })}
                />
                <div className="setting-field">
                  <span>Accent colour</span>
                  <div
                    className="swatches"
                    role="group"
                    aria-label="Accent colour"
                  >
                    {[
                      ["#3355df", "Cobalt"],
                      ["#087f76", "Teal"],
                      ["#9652cc", "Violet"],
                      ["#c45027", "Terracotta"],
                    ].map(([color, name]) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={name}
                        aria-pressed={config.accent === color}
                        style={{ background: color }}
                        onClick={() => configure({ accent: color })}
                      >
                        {config.accent === color && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="setting-row disabled-setting">
                  <label htmlFor="disabled">Disabled state</label>
                  <Switch
                    id="disabled"
                    checked={config.disabled}
                    onCheckedChange={(value) => configure({ disabled: value })}
                    disabled={busy}
                    className="demo-switch"
                  />
                </div>
                <div className="formats">
                  <p>SUPPORTED FORMATS</p>
                  <div>
                    {IMAGE_TYPES.map((type) => (
                      <span key={type}>
                        {type
                          .replace("image/", "")
                          .replace("jpeg", "jpg")
                          .toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="settings-hint">
                  Changing selection limits starts a fresh selection.
                </p>
              </aside>
            </div>
          </TabsContent>
          <TabsContent value="integration" className="integration-panel">
            <div className="integration-intro">
              <p className="eyebrow">A SMALL API. YOUR OWN WORKFLOW.</p>
              <h2>Yours to build with.</h2>
              <p>
                A standalone React component. Bring your own upload logic, keep
                complete control of your files.
              </p>
            </div>
            <div className="integration-columns">
              <div>
                <h3>1. Add the local package</h3>
                <p>
                  Download the component, place it in your project, then
                  install:
                </p>
                <pre className="install-code">
                  npm install ./aryansehgal-framepick-0.1.0.tgz
                </pre>
                <p className="small-note">
                  Local package download · Not published to npm
                </p>
                <h3>2. Pick your level of control</h3>
                <p>
                  Use <code>value</code> and <code>onValueChange</code> for
                  controlled selection. Omit <code>value</code> for built-in
                  state.
                </p>
                <h3>3. Connect your application</h3>
                <p>
                  Each selected item is a native <code>File</code>. Pass it to
                  your image-processing pipeline or your own upload endpoint.
                </p>
                <a
                  className="text-link"
                  href="/downloads/component-readme.md"
                  download
                >
                  Full API & implementation notes <ArrowUpRight size={14} />
                </a>
              </div>
              <div className="code-card">
                <div className="code-heading">
                  <span>ImageInput.tsx</span>
                  <button type="button" onClick={copyCode}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre>
                  <code>{snippet}</code>
                </pre>
              </div>
            </div>
            <div className="api-notes">
              <h3>Designed with boundaries.</h3>
              <p>
                Selection, previews, and validation happen locally. Uploading,
                cropping, compression, and persistent storage belong to your
                application. Client-side checks improve UX; validate files again
                on your server.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        <div className="principles">
          <div>
            <MousePointer2 />
            <span>
              Keyboard, meet mouse.
              <small>Native selection. Visible focus.</small>
            </span>
          </div>
          <div>
            <ScanEye />
            <span>
              The details, upfront.
              <small>Preview, dimensions, and file size.</small>
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              Your files are yours.
              <small>No server. No background uploads.</small>
            </span>
          </div>
        </div>
        <p className="fp-sr-only" role="status">
          {notice}
        </p>
      </main>
      <footer className="site-footer">
        <span>Designed & built for the next thing you make.</span>
        <span>
          React + TypeScript <span className="footer-divider">/</span> MIT
          licensed
        </span>
      </footer>
    </div>
  );
}
