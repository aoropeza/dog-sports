import { SessionDetail } from "@/components/sessions/SessionDetail";

export const metadata = { title: "Sesión · Entrenamiento canino" };

export default async function SessionPage({ params }: PageProps<"/sesiones/[id]">) {
  const { id } = await params;
  return <SessionDetail id={id} />;
}
