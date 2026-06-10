function DailyActivityChart({ series = [] }) {
  const maxValue = Math.max(...series.map((item) => item.views + item.downloads), 1);

  return (
    <section className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">Activite recente</h3>
          <p className="mt-1 text-sm font-bold text-neutral-500">Vues et telechargements sur les 14 derniers jours.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-black" />
            Vues
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#9cff00]" />
            Downloads
          </span>
        </div>
      </div>

      <div className="flex h-64 min-w-0 items-end gap-2 overflow-x-auto pb-2">
        {series.map((day) => {
          const total = day.views + day.downloads;
          const height = Math.max((total / maxValue) * 100, total > 0 ? 8 : 2);

          return (
            <div key={day.date} className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-48 w-full items-end rounded-full bg-neutral-100 p-1">
                <div
                  className="flex w-full flex-col justify-end overflow-hidden rounded-full bg-black"
                  style={{ height: `${height}%` }}
                  title={`${day.views} vues, ${day.downloads} downloads`}
                >
                  <span
                    className="block w-full bg-[#9cff00]"
                    style={{ height: total ? `${(day.downloads / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              <span className="max-w-12 truncate text-[11px] font-extrabold text-neutral-500">{day.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DailyActivityChart;
