// Panellerin köşelerine konan bulanık kırmızı/bordo ışık efekti — dekoratif.
// Kullanıldığı panel `relative overflow-hidden` olmalı, gerçek içerik
// `relative z-[1]` bir sarmalayıcı içinde olmalı ki ışığın üstünde kalsın.
export default function PanelGlow() {
  return (
    <>
      <span className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-accent/35 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />
    </>
  );
}
