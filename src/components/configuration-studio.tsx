"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  Download,
  FileCode2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  configurationPresets,
  createConfiguration,
  starterZone,
  validatePort,
  type ConfigurationPreset,
} from "@/lib/configuration";
import { handleTabKeyDown } from "@/lib/keyboard";
import { CodeBlock } from "./ui";

export function ConfigurationStudio() {
  const [preset, setPreset] = useState<ConfigurationPreset>("forwarder");
  const [port, setPort] = useState("5353");
  const [cache, setCache] = useState(true);
  const [dnssec, setDnssec] = useState(true);
  const reducedMotion = useReducedMotion();
  const selected = configurationPresets.find((item) => item.id === preset)!;
  const error = validatePort(port);
  const config = error
    ? null
    : createConfiguration({ preset, port, cache, dnssec });
  function download(filename: string, value: string) {
    const url = URL.createObjectURL(
      new Blob([value], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="configuration-studio">
      <div
        className="recipe-choices"
        role="tablist"
        aria-label="Network starting point"
      >
        {configurationPresets.map((item, index) => (
          <button
            type="button"
            key={item.id}
            role="tab"
            id={`recipe-${item.id}`}
            aria-selected={preset === item.id}
            aria-controls="recipe-panel"
            tabIndex={preset === item.id ? 0 : -1}
            onKeyDown={handleTabKeyDown}
            onClick={() => setPreset(item.id)}
          >
            <span className="mono">0{index + 1}</span>
            {item.label}
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
      <div
        id="recipe-panel"
        role="tabpanel"
        aria-labelledby={`recipe-${preset}`}
        className="recipe-panel"
      >
        <div className="recipe-options">
          <span className="mono studio-label">YOUR STARTING POINT</span>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <div className="recipe-path" aria-hidden="true">
            {selected.path.map((name, index) => (
              <div key={name}>
                {index > 0 && <ArrowRight size={15} />}
                <span
                  className={
                    index === 1 ? "recipe-node active-node" : "recipe-node"
                  }
                >
                  {index === 1 && <span className="small-dot" />}
                  {name}
                </span>
              </div>
            ))}
          </div>
          <label className="port-field">
            DNS listener port
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="65535"
              value={port}
              onChange={(event) => setPort(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "port-error" : "listener-help"}
            />
          </label>
          {error && (
            <p className="field-error" role="alert" id="port-error">
              {error}
            </p>
          )}
          <p className="field-help" id="listener-help">
            Bound to 127.0.0.1. The default port 5353 keeps this local starter
            separate from your system’s DNS.
          </p>
          <label className="recipe-toggle">
            <Zap size={18} />
            <span>
              <strong>Answer caching</strong>
              <small>Reuse answers within their TTL.</small>
            </span>
            <input
              type="checkbox"
              checked={cache}
              onChange={(event) => setCache(event.target.checked)}
              aria-label="Enable answer caching"
            />
            <i aria-hidden="true" />
          </label>
          <label className="recipe-toggle">
            <ShieldCheck size={18} />
            <span>
              <strong>DNSSEC validation</strong>
              <small>Validate signed answers.</small>
            </span>
            <input
              type="checkbox"
              checked={dnssec}
              onChange={(event) => setDnssec(event.target.checked)}
              aria-label="Enable DNSSEC validation"
            />
            <i aria-hidden="true" />
          </label>
          <button
            type="button"
            className="button"
            disabled={!config}
            onClick={() => config && download("nothingdns.yaml", config)}
          >
            <Download size={17} />
            Download configuration
          </button>
        </div>
        <motion.div
          className="recipe-output"
          key={preset}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <div className="recipe-output-label">
            <FileCode2 size={16} />
            <span>nothingdns.yaml</span>
            <span className="mono">
              <Check size={12} />
              LOCAL RECIPE
            </span>
          </div>
          {config ? (
            <CodeBlock
              code={config}
              label="Your configuration"
              language="yaml"
            />
          ) : (
            <div className="invalid-recipe">
              Set a valid port to generate your configuration.
            </div>
          )}
        </motion.div>
      </div>
      {preset === "authoritative" && (
        <div className="zone-download">
          <div>
            <FileCode2 size={21} />
            <span>
              <strong>Your zone file goes with it.</strong>
              <small>
                Save example.test.zone beside nothingdns.yaml. It uses reserved
                example addresses.
              </small>
            </span>
          </div>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => download("example.test.zone", starterZone)}
          >
            <Download size={16} />
            Download zone file
          </button>
        </div>
      )}
      {config && (
        <div className="studio-next">
          <div>
            <span className="mono">NEXT, MEET YOUR SERVER</span>
            <p>Validate the file, start NothingDNS, then send a local query.</p>
          </div>
          <CodeBlock
            code={`nothingdns -validate-config -config ./nothingdns.yaml\nnothingdns -config ./nothingdns.yaml\n\n# In another terminal\ndig @127.0.0.1 -p ${Number(port)} ${preset === "authoritative" ? "example.test" : "example.com"}`}
            label="Try your recipe"
          />
        </div>
      )}
    </div>
  );
}
