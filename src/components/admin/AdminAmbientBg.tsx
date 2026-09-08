// Koyu admin arka planında yavaşça süzülen bulanık kırmızı/bordo ışıklar,
// altlarında saydam + hafif bulanık bir kafe fotoğrafı — saf dekorasyon,
// tıklanamaz, sayfa akışını etkilemez.
export default function AdminAmbientBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/admin-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.32] blur-2xl"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--bg) 0%, transparent 12%, transparent 88%, var(--bg) 100%)",
        }}
      />
      <div className="admin-glow-blobs transition-opacity duration-300">
        <span className="animate-drift-a absolute -left-24 top-[-10%] h-[420px] w-[420px] rounded-full bg-accent/25 blur-[110px]" />
        <span className="animate-drift-b absolute -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-accent/15 blur-[110px]" />
        <span className="animate-drift-c absolute bottom-[-15%] left-1/4 h-[340px] w-[340px] rounded-full bg-accent/20 blur-[110px]" />
      </div>
    </div>
  );
}
