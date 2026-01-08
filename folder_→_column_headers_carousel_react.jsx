import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Upload, RefreshCw, Search } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Files → Column Headers Carousel
 *
 * Features
 * - Upload one or more files (CSV, TSV, XLSX, XLS)
 * - Aggregates column names across all files
 * - For each column, shows 2–3 example values (deduped) on hover
 * - Horizontal carousel with arrow controls + wheel/trackpad scroll
 * - Lightweight, no backend required
 */
export default function ColumnHeadersCarouselApp() {
  const [columnMap, setColumnMap] = useState(new Map());
  const [fileStats, setFileStats] = useState({ total: 0, parsed: 0, errors: 0 });
  const [isParsing, setIsParsing] = useState(false);
  const [filter, setFilter] = useState("");
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  const columns = useMemo(() => {
    const all = Array.from(columnMap.entries()).map(([name, examples]) => ({ name, examples }));
    if (!filter.trim()) return all.sort((a, b) => a.name.localeCompare(b.name));
    const f = filter.toLowerCase();
    return all
      .filter((c) => c.name.toLowerCase().includes(f))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [columnMap, filter]);

  function resetAll() {
    setColumnMap(new Map());
    setFileStats({ total: 0, parsed: 0, errors: 0 });
    setFilter("");
    if (inputRef.current) inputRef.current.value = "";
  }

  // Helpers
  function addExample(col, val) {
    if (val === undefined || val === null) return;
    const str = String(val).trim();
    if (!str) return;
    setColumnMap((prev) => {
      const next = new Map(prev);
      const existing = next.get(col) ?? [];
      if (existing.includes(str)) return next;
      if (existing.length >= 3) return next; // keep only up to 3 examples
      next.set(col, [...existing, str]);
      return next;
    });
  }

  async function parseCSVLike(file) {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        preview: 200,
        skipEmptyLines: true,
        worker: true,
        complete: (res) => {
          const fields = res.meta.fields || [];
          fields.forEach((f) => {
            setColumnMap((prev) => (prev.has(f) ? new Map(prev) : new Map(prev).set(f, [])));
          });
          const rows = res.data || [];
          for (const row of rows) {
            for (const key of fields) {
              // Let addExample enforce the 3-example cap; don't rely on potentially stale state here
              addExample(key, row[key]);
            }
          }
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  async function parseExcel(file) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) return;
    const ws = wb.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (!json.length) return;
    const headers = json[0].map((v) => String(v || "").trim());
    headers.forEach((h) => {
      if (!h) return;
      setColumnMap((prev) => (prev.has(h) ? new Map(prev) : new Map(prev).set(h, [])));
    });
    const rows = json.slice(1, 201);
    for (const r of rows) {
      headers.forEach((h, idx) => {
        if (!h) return;
        const v = r[idx];
        // Don't pre-check state; addExample will de-dupe and cap
        addExample(h, v);
      });
    }
  }

  function getFileKind(name) {
    const n = name.toLowerCase();
    if (n.endsWith(".csv") || n.endsWith(".tsv") || n.endsWith(".txt")) return "csv";
    if (n.endsWith(".xlsx") || n.endsWith(".xls")) return "xlsx";
    return "unknown";
  }

  async function handleFilesUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsParsing(true);
    setColumnMap(new Map());
    setFileStats({ total: files.length, parsed: 0, errors: 0 });

    for (const file of files) {
      try {
        const kind = getFileKind(file.name);
        if (kind === "csv") await parseCSVLike(file);
        else if (kind === "xlsx") await parseExcel(file);
        setFileStats((s) => ({ ...s, parsed: s.parsed + 1 }));
      } catch (err) {
        console.error("Parse error", err);
        setFileStats((s) => ({ ...s, parsed: s.parsed + 1, errors: s.errors + 1 }));
      }
    }

    setIsParsing(false);
  }

  function scrollByAmount(dx) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Files → Columns Carousel</h1>
              <p className="mt-1 text-sm text-neutral-600">
                Upload one or more data files (CSV/TSV/XLSX). We’ll aggregate the column headers and show quick samples on hover.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={resetAll} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Reset
              </Button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90">
                <Upload className="h-4 w-4" />
                Upload Files
                <Input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFilesUpload}
                />
              </label>
            </div>
          </header>

          <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm text-neutral-500">Files</div>
              <div className="mt-1 text-lg font-semibold">{fileStats.parsed} / {fileStats.total}</div>
              {fileStats.errors > 0 && (
                <div className="mt-1 text-xs text-red-600">{fileStats.errors} error(s)</div>
              )}
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm text-neutral-500">Columns Found</div>
              <div className="mt-1 text-lg font-semibold">{columnMap.size}</div>
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                  placeholder="Filter columns…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500">Hover a tile to see 2–3 example values.</p>
            </div>
          </section>

          <section className="relative">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">Column Headers</h2>
              {isParsing && <div className="animate-pulse text-sm text-neutral-500">Parsing…</div>}
            </div>

            <div className="group relative">
              <Button
                variant="secondary"
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full shadow md:opacity-0 md:group-hover:opacity-100"
                onClick={() => scrollByAmount(-400)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div
                ref={scrollerRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm"
              >
                {columns.length === 0 && (
                  <div className="flex h-24 w-full items-center justify-center text-sm text-neutral-500">
                    {isParsing ? "Scanning your files…" : "No columns yet. Upload files to get started."}
                  </div>
                )}

                {columns.map((col) => (
                  <Tooltip key={col.name}>
                    <TooltipTrigger asChild>
                      <Card className="group/card relative w-64 shrink-0 snap-start rounded-2xl border bg-white transition-transform hover:-translate-y-0.5">
                        <CardHeader className="pb-2">
                          <CardTitle className="truncate text-base">{col.name}</CardTitle>
                          <div className="mt-1 text-xs text-neutral-500">{col.examples.length} example(s)</div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-neutral-500">Hover to preview</div>
                          {/* Inline hover panel to avoid any tooltip/portal issues */}
                          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border bg-neutral-50 p-3 text-sm opacity-0 shadow transition-opacity duration-150 group-hover/card:opacity-100">
                            <div className="mb-1 text-xs text-neutral-500">Examples</div>
                            <ul className="list-disc pl-5">
                              {col.examples.length > 0 ? (
                                col.examples.map((ex, i) => (
                                  <li key={i} className="truncate">{ex}</li>
                                ))
                              ) : (
                                <li className="italic text-neutral-500">(no non-empty examples yet)</li>
                              )}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center" className="max-w-sm">
                      <div className="text-xs text-neutral-500">Examples</div>
                      <ul className="mt-1 list-disc pl-5 text-sm">
                        {col.examples.length > 0 ? (
                          col.examples.map((ex, i) => (
                            <li key={i} className="truncate">{ex}</li>
                          ))
                        ) : (
                          <li className="italic text-neutral-500">(no non-empty examples found yet)</li>
                        )}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              <Button
                variant="secondary"
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full shadow md:opacity-0 md:group-hover:opacity-100"
                onClick={() => scrollByAmount(400)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </section>

          <footer className="mt-8 text-center text-xs text-neutral-500">
            Tip: You can drag-scroll the carousel or use the arrow buttons. Supported: CSV, TSV, XLSX, XLS.
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
