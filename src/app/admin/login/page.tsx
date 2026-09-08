import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/panel-logo.png" alt="Vefalı Panel" className="mb-8 h-72 w-auto object-contain" />
      <LoginForm />
    </div>
  );
}
