import React, { useMemo } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Button } from "@/shared/components/ui";
import { useJobEvaluationStore } from "../jobEvaluationStore";
import { evaluate } from "../lib/payPolicy";
import { JobsTab } from "./JobsTab";
import { PolicyTab } from "./PolicyTab";
import { StructureTab } from "./StructureTab";
import { EmployeesTab } from "./EmployeesTab";

const TABS = ["1. Rate jobs", "2. Pay policy", "3. Structure", "4. Employees and equity"];

const JobEvaluationPage: React.FC = () => {
  const { jobs, factors, totalPoints, policy, loadExample, reset } = useJobEvaluationStore();
  const evaluation = useMemo(
    () => evaluate(jobs, factors, totalPoints, policy),
    [jobs, factors, totalPoints, policy]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-left sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-sage-900">Job evaluation</h1>
          <p className="mt-1 max-w-3xl text-slate-600">
            Turn a job analysis into points, the points into a pay line that follows your pay
            philosophy, and the pay line into grades, ranges and pay checks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              if (!jobs.length || window.confirm("Replace your current jobs with the example?"))
                loadExample();
            }}
          >
            Load worked example
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm("Clear all jobs, policy settings and employees?")) reset();
            }}
          >
            Start over
          </Button>
        </div>
      </header>

      <TabGroup>
        <TabList className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
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
            <JobsTab />
          </TabPanel>
          <TabPanel>
            <PolicyTab evaluation={evaluation} />
          </TabPanel>
          <TabPanel>
            <StructureTab evaluation={evaluation} />
          </TabPanel>
          <TabPanel>
            <EmployeesTab evaluation={evaluation} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <p className="mt-10 text-xs text-slate-500">
        Your data stays in this browser. The worked example uses U.S. Bureau of Labor Statistics
        OEWS national medians for May 2025; replace them with data for your own labour market.
      </p>
    </div>
  );
};

export default JobEvaluationPage;
