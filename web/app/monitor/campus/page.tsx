import { loadClasses, loadStreams } from "@/lib/data";
import { requireMonitorWorkspace } from "@/lib/workspace";

export const metadata = { title: "Classes" };

export default async function CampusPage() {
  const workspace = await requireMonitorWorkspace();
  const schoolId = workspace.school.school_id;
  const [classes, streams] = await Promise.all([loadClasses(schoolId), loadStreams(schoolId)]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-semibold">Classes and streams</h1>
        <p className="mt-2 text-sm opacity-75">
          Campus structure lives in Metroskool Admin. Monitor references those classes and streams;
          it does not duplicate them.
        </p>
      </section>
      {classes.length === 0 ? (
        <p className="text-sm opacity-70">No active classes yet. Add them in Metroskool Admin.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {classes.map((row) => {
            const classStreams = streams.filter((stream) => stream.class_id === row.id);
            return (
              <li
                key={row.id}
                className="rounded-xl border border-[var(--ms-color-light-purple)]/40 bg-white px-4 py-3"
              >
                <p className="text-sm font-medium">
                  {row.name}
                  {row.code ? <span className="opacity-70"> · {row.code}</span> : null}
                </p>
                <p className="mt-1 text-sm opacity-70">
                  {classStreams.length === 0
                    ? "No streams"
                    : classStreams.map((stream) => stream.name).join(", ")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
