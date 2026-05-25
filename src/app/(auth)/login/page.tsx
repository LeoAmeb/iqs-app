"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/cotizador");
    } else {
      toast.error("Credenciales incorrectas. Intenta de nuevo.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <Card className="w-full max-w-sm border-[#e2e2e2]">
        <CardHeader className="text-center pb-4">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <svg width="210" height="38" viewBox="0 0 210 38" xmlns="http://www.w3.org/2000/svg">
              <text x="2" y="24" fontFamily="Arial,sans-serif" fontSize="20" fontWeight="300" letterSpacing="1" fill="#111">IDEAS</text>
              <text x="72" y="24" fontFamily="Arial,sans-serif" fontSize="20" fontWeight="800" letterSpacing="0.5" fill="#111">QSOLUCIONAN</text>
              <text x="2" y="36" fontFamily="Arial,sans-serif" fontSize="7.5" fontWeight="600" fill="#777" letterSpacing="2.5">|CORTE Y GRABADO CNC|</text>
            </svg>
          </div>
          <p className="text-sm text-[#5c5c5c]">Inicia sesión para continuar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@iqs.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
