// Bakım modu açıkken müşteri tarafında menü yerine bu ekran gösterilir.
export default function MaintenanceScreen({ logoUrl }: { logoUrl?: string }) {
  return (
    <div className="doodle-bg flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="animate-card-in w-full max-w-sm rounded-[28px] bg-white p-8 shadow-panel">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Vefalı"
            className="mx-auto mb-6 h-12 w-auto object-contain"
          />
        ) : (
          <p className="mb-6 font-heading text-[26px] font-extrabold tracking-tight text-accent">
            VEFALI
          </p>
        )}

        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-3xl">
          🛠️
        </div>

        <h1 className="font-heading text-[22px] font-extrabold leading-tight text-ink">
          Bakımdayız
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Sizlere daha iyi hizmet vermek için güncelleniyoruz. Yakında tekrar
          aranızdayız.
        </p>
      </div>
    </div>
  );
}
