import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Button } from "@/shared/components/ui";
import { dataOf, useJobEvaluationStore } from "../jobEvaluationStore";
import { evaluateAll } from "../lib/assemble";
import { METHOD_INFO } from "../lib/plans";
import { parseOjaProject } from "../lib/openJobAnalysis";
import { EvaluationFileError, fromFile, takeInbox, toFile } from "../lib/evaluationFile";
import { eigeExample, part6Example } from "../example";
import { SetupTab } from "./SetupTab";
import { JobsTab } from "./JobsTab";
import { GroupsTab } from "./GroupsTab";
import { StructureTab } from "./StructureTab";
import { EmployeesTab } from "./EmployeesTab";
import { ReportsTab } from "./ReportsTab";
import { downloadText } from "./print";

const TABS = [
  "1. Set up",
  "2. Rate jobs",
  "3. Gender and groups",
  "4. Pay structure",
  "5. Employees",
  "6. Reports",
];

const JobEvaluationPage: React.FC = () => {
  const store = useJobEvaluationStore();
  const data = dataOf(store);
  const ev = useMemo(() => evaluateAll(data), [store]); // eslint-disable-line react-hooks/exhaustive-deps
  const [tab, setTab] = useState(store.jobs.length ? 1 : 0);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Projects sent from Open Job Analysis with "Send to JobEval".
  useEffect(() => {
    const items = takeInbox();
    if (!items.length) return;
    let added = 0;
    let updated = 0;
    for (const item of items) {
      try {
        const r = useJobEvaluationStore.getState().importOja(parseOjaProject(item));
        if (r.updated) updated++;
        else added++;
      } catch {
        /* skip anything that is not a project */
      }
    }
    if (added + updated) {
      setTab(1);
      setNotice(
        `From Open Job Analysis: ${[added && `${added} job${added > 1 ? "s" : ""} added`, updated && `${updated} updated`].filter(Boolean).join(", ")}.`
      );
    }
  }, []);

  const load = (which: "part6" | "eige") => {
    if (store.jobs.length && !window.confirm("Replace your current work with the example?")) return;
    store.replaceAll(which === "part6" ? part6Example() : eigeExample());
    setTab(1);
  };

  const openFile = async (file: File) => {
    try {
      const d = fromFile(await file.text());
      if (store.jobs.length && !window.confirm("Replace your current work with this file?")) return;
      store.replaceAll(d);
      setNotice(`Opened ${file.name}.`);
    } catch (e) {
      setNotice(e instanceof EvaluationFileError ? e.message : "The file could not be read.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-left sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-sage-900">Job evaluation</h1>
          <p className="mt-1 max-w-3xl text-slate-600">
            Compare the value of every job on skills, responsibility, effort and working conditions,
            the criteria in the EU Pay Transparency Directive. Then build grades and pay ranges and
            check pay between women and men. Method: {METHOD_INFO[store.settings.method].name}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Load a worked example"
            className="select w-auto"
            value=""
            onChange={(e) => e.target.value && load(e.target.value as "part6" | "eige")}
          >
            <option value="">Load a worked example…</option>
            <option value="eige">EU toolkit example (catering company)</option>
            <option value="part6">Part 6: From Job Analysis to Pay</option>
          </select>
          <Button
            variant="secondary"
            onClick={() =>
              downloadText(
                `job-evaluation-${new Date().toISOString().slice(0, 10)}.json`,
                toFile(dataOf(store)),
                "application/json"
              )
            }
          >
            Save file
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Open file
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm("Clear all jobs, settings and employees?")) store.reset();
            }}
          >
            Start over
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void openFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      {notice && (
        <p role="status" className="mb-4 rounded-md bg-sage-50 p-3 text-sm text-sage-900">
          {notice}{" "}
          <button type="button" className="ml-2 underline" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </p>
      )}

      <TabGroup selectedIndex={tab} onChange={setTab}>
        <TabList className="no-print mb-6 flex flex-wrap gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <Tab
              key={t}
              className="-mb-px border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:text-sage-900 focus:outline-none data-[focus]:ring-2 data-[focus]:ring-accent data-[selected]:border-sage-600 data-[selected]:text-sage-900"
            >
              {t}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <SetupTab />
          </TabPanel>
          <TabPanel>
            <JobsTab ev={ev} />
          </TabPanel>
          <TabPanel>
            <GroupsTab ev={ev} />
          </TabPanel>
          <TabPanel>
            <StructureTab ev={ev} />
          </TabPanel>
          <TabPanel>
            <EmployeesTab ev={ev} />
          </TabPanel>
          <TabPanel>
            <ReportsTab ev={ev} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <p className="mt-10 text-xs text-slate-500">
        Your data stays in this browser until you save a file; the file holds employee pay, so keep
        it safe. The factor and subfactor plan, levels and guidance come from EIGE&apos;s EU-wide
        guidelines on gender-neutral job evaluation and classification (step-by-step toolkit). The
        Part 6 example uses U.S. BLS OEWS national medians for May 2025.
      </p>
    </div>
  );
};

export default JobEvaluationPage;
