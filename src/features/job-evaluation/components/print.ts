/** Prints one section of the page: everything else is hidden while the dialog is open. */
export function printSection(el: HTMLElement | null) {
  if (!el) return;
  el.classList.add("print-me");
  document.body.classList.add("printing-one");
  const done = () => {
    el.classList.remove("print-me");
    document.body.classList.remove("printing-one");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
}

export function downloadText(name: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const csvRow = (cells: (string | number | null | undefined)[]) =>
  cells
    .map((c) => {
      const s = c === null || c === undefined ? "" : String(c);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
