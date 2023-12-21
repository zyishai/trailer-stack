export default function EmptyPreview() {
  return (
    <div className="grid h-full place-content-center border-4 border-dashed border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-2 text-center">
        <span className="small muted">
          Select a template from the menu to preview it here.
        </span>
        <span className="muted">
          Create or edit your template files in{" "}
          <samp>app/components/emails</samp> folder to see them updated here.
        </span>
      </div>
    </div>
  );
}
