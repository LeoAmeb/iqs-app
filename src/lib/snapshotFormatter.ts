export interface SnapshotEntry {
  label: string;
  value: string;
}

// Fields that belong to client data, not product data — skip these
const CLIENT_FIELDS = new Set(["nombre", "telefono", "fechaEntrega", "horaEntrega", "notas"]);

function bool(v: unknown): string {
  return v ? "Sí" : "No";
}

function money(v: unknown): string {
  return "$" + Math.round(Number(v)).toLocaleString("es-MX");
}

function add(
  entries: SnapshotEntry[],
  label: string,
  value: unknown,
  condition = true
): void {
  if (!condition) return;
  if (value === null || value === undefined || value === "" || value === false) return;
  entries.push({ label, value: String(value) });
}

export function formatSnapshot(
  categoria: string,
  snap: Record<string, unknown>
): SnapshotEntry[] {
  const entries: SnapshotEntry[] = [];

  // Skip if snapshot is basically a client-data blob (legacy single-product)
  const hasProductFields = Object.keys(snap).some((k) => !CLIENT_FIELDS.has(k));
  if (!hasProductFields) return entries;

  switch (categoria) {
    case "logos": {
      const tipo = snap.tipo as string;
      if (tipo === "base") {
        add(entries, "Tipo", "Con base");
        add(entries, "Tamaño", `${snap.tamano} px²`);
        add(entries, "Cantidad", snap.cantidad);
        const chapeton = String(snap.chapeton ?? "");
        add(entries, "Chapetón", chapeton.charAt(0).toUpperCase() + chapeton.slice(1));
        add(entries, "Color base", snap.colorBase);
        add(entries, "Color diseño", snap.colorDiseno);
        if (snap.terceraCapa) {
          add(entries, "3ª Capa", "Sí");
          add(entries, "Color 3ª capa", snap.colorTercera);
        }
        if (snap.led) {
          add(entries, "LED", "Sí");
          add(entries, "Color LED", snap.colorLed);
        }
        add(entries, "Instalación", bool(snap.instalacion), !!snap.instalacion);
        add(entries, "Urgente", bool(snap.urgente), !!snap.urgente);
        add(entries, "Mismo día", bool(snap.mismodia), !!snap.mismodia);
      } else {
        add(entries, "Tipo", tipo === "sinbase_a" ? "Sin base (A)" : "Sin base (B)");
        add(entries, "Ancho", `${snap.ancho} cm`);
        add(entries, "Alto", `${snap.alto} cm`);
        add(entries, "Cantidad", snap.cantidad_sb);
        add(entries, "Instalación", bool(snap.instalacion_sb), !!snap.instalacion_sb);
        add(entries, "Urgente", bool(snap.urgente_sb), !!snap.urgente_sb);
        add(entries, "Mismo día", bool(snap.mismodia_sb), !!snap.mismodia_sb);
      }
      break;
    }

    case "neon": {
      add(entries, "Precio base", money(snap.tipo));
      add(entries, "Complejidad", `${snap.complejidad} pc`);
      const metrajes: Record<string, string> = { normal: "Normal", medio: "Medio", largo: "Largo" };
      add(entries, "Metraje", metrajes[String(snap.metraje)] ?? String(snap.metraje));
      const chapetonN = String(snap.chapeton ?? "");
      add(entries, "Chapetón", chapetonN.charAt(0).toUpperCase() + chapetonN.slice(1));
      add(entries, "Color", snap.colorPrincipal);
      add(entries, "Cantidad", snap.cantidad);
      add(entries, "Apagador", bool(snap.apagador), !!snap.apagador);
      add(entries, "Instalación", bool(snap.instalacion), !!snap.instalacion);
      add(entries, "Urgente", bool(snap.urgente), !!snap.urgente);
      add(entries, "Mismo día", bool(snap.mismodia), !!snap.mismodia);
      break;
    }

    case "toppers": {
      add(entries, "Tamaño", `${snap.tamano} cm`);
      add(entries, "Cliente", snap.tipoCliente === "nuevo" ? "Nuevo" : "Frecuente");
      add(entries, "Color", snap.color);
      if (snap.nombre) add(entries, "Nombre", snap.nombre);
      if (Number(snap.extra) > 0) add(entries, "Extra", money(snap.extra));
      add(entries, "Cantidad", snap.cantidad);
      add(entries, "Urgente", bool(snap.urgente), !!snap.urgente);
      break;
    }

    case "mdf": {
      const subtipo = snap.subtipo as string;
      const subtipoLabel: Record<string, string> = {
        nombres: "Nombres", bases: "Bases", llaveros: "Llaveros", manual: "Manual",
      };
      add(entries, "Subtipo", subtipoLabel[subtipo] ?? subtipo);
      if (subtipo === "nombres") {
        add(entries, "Tamaño", `${snap.tamNombres} mm`);
        add(entries, "Cantidad", snap.cantNombres);
        add(entries, "Acabado", snap.acabado === "natural" ? "Natural" : "Pintado");
        if (snap.acabado === "pintado" && Number(snap.vinilMetros) > 0) {
          add(entries, "Vinil", `${snap.vinilMetros} m`);
        }
      } else if (subtipo === "bases") {
        add(entries, "Material", snap.materialBases);
        const bases = snap.basesItems as Array<{ medida: string; cant: number }> | undefined;
        if (bases?.length) {
          add(entries, "Medidas", bases.map((b) => `${b.cant}×${b.medida}`).join(", "));
        }
      } else if (subtipo === "llaveros") {
        add(entries, "Cantidad", snap.cantLlaveros);
      } else if (subtipo === "manual") {
        add(entries, "Precio", money(snap.precioManual));
        if (snap.notasManual) add(entries, "Notas", snap.notasManual);
      }
      add(entries, "Urgente", bool(snap.urgente), !!snap.urgente);
      add(entries, "Mismo día", bool(snap.mismodia), !!snap.mismodia);
      break;
    }

    case "termos": {
      if (snap.termoPropio) {
        add(entries, "Tipo", "Termo propio");
        const propioLabels: Record<string, string> = {
          solo_1: "Solo cara 1", solo_2: "Solo cara 2",
          mayoreo_corto: "Mayoreo corto", mayoreo_nombre: "Mayoreo nombre",
        };
        add(entries, "Proceso", propioLabels[String(snap.propioTipo)] ?? String(snap.propioTipo));
      } else {
        add(entries, "Tamaño", `${snap.tamano} oz`);
        add(entries, "Color", snap.color);
        if (Number(snap.mayoreo) > 0) add(entries, "Mayoreo", `${snap.mayoreo} uds`);
        add(entries, "Cantidad", snap.cantidad);
      }
      add(entries, "Urgente", bool(snap.urgente), !!snap.urgente);
      break;
    }

    case "displays": {
      add(entries, "Precio base", money(snap.tipo));
      add(entries, "Cantidad", snap.cantidad);
      add(entries, "3ª Capa", bool(snap.terceraCapa), !!snap.terceraCapa);
      add(entries, "Urgente", bool(snap.urgente), !!snap.urgente);
      break;
    }

    case "grabado": {
      add(entries, "Cliente", snap.tipoCliente === "nuevo" ? "Nuevo" : "Frecuente");
      const tamLabels: Record<string, string> = {
        pequeno: "Pequeño", mediano: "Mediano", grande: "Grande",
      };
      add(entries, "Tamaño", tamLabels[String(snap.tam)] ?? String(snap.tam));
      if (snap.objeto) add(entries, "Objeto", snap.objeto);
      add(entries, "Cantidad", snap.cantidad);
      add(entries, "Urgente", bool(snap.urgente), !!snap.urgente);
      add(entries, "Mismo día", bool(snap.mismodia), !!snap.mismodia);
      break;
    }

    case "corte": {
      add(entries, "Material", snap.material === "acrilico" ? "Acrílico" : "MDF");
      add(entries, "Ancho", `${snap.ancho} cm`);
      add(entries, "Alto", `${snap.alto} cm`);
      add(entries, "Cantidad", snap.cantidad);
      add(entries, "Urgente", bool(snap.urgente), !!snap.urgente);
      add(entries, "Mismo día", bool(snap.mismodia), !!snap.mismodia);
      break;
    }

    case "personalizado": {
      add(entries, "Horas", `${snap.horas} hrs`);
      if (Number(snap.materiales) > 0) add(entries, "Materiales", money(snap.materiales));
      if (Number(snap.extras) > 0) add(entries, "Extras", money(snap.extras));
      if (Number(snap.margenExtra) > 0) add(entries, "Margen extra", `${snap.margenExtra}%`);
      break;
    }
  }

  return entries;
}
