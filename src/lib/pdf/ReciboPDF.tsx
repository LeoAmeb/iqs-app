import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatSnapshot } from "@/lib/snapshotFormatter";

interface PedidoItemPDF {
  catLabel: string;
  emoji: string;
  total: number;
  categoria?: string;
  formSnapshot?: Record<string, unknown>;
}

interface ReciboPDFProps {
  folio: number;
  fecha: string;
  catLabel: string;
  clienteNombre: string;
  total: number;
  anticipo: number;
  saldo: number;
  formaPago?: string | null;
  fechaEntrega?: string | null;
  horaEntrega?: string | null;
  notas?: string | null;
  items?: PedidoItemPDF[];
}

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-MX");
}

function folioStr(n: number): string {
  return "#" + String(n).padStart(4, "0");
}

const FORMA_PAGO_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: "#111",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottom: "2 solid #111",
    paddingBottom: 16,
  },
  brand: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 7,
    color: "#777",
    letterSpacing: 2,
    marginTop: 2,
  },
  folioBox: {
    alignItems: "flex-end",
  },
  folioText: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111",
  },
  folioLabel: {
    fontSize: 8,
    color: "#777",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    color: "#777",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 8,
    color: "#777",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    borderBottom: "1 solid #e2e2e2",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottom: "1 solid #f0f0f0",
  },
  rowLabel: {
    color: "#444",
  },
  rowVal: {
    fontFamily: "Helvetica-Bold",
  },
  saldoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "2 solid #111",
  },
  saldoLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  saldoVal: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#c00",
  },
  saldoValOk: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#16a34a",
  },
  badge: {
    marginTop: 16,
    backgroundColor: "#f0fdf4",
    border: "1 solid #bbf7d0",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 9,
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
  },
  notesBox: {
    marginTop: 20,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 7,
    color: "#777",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#444",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#aaa",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingLeft: 8,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 4,
  },
  detailCell: {
    width: "48%",
    marginBottom: 3,
  },
  detailLabel: {
    fontSize: 7,
    color: "#999",
  },
  detailValue: {
    fontSize: 8,
    color: "#333",
  },
});

export function ReciboPDF({
  folio,
  fecha,
  catLabel,
  clienteNombre,
  total,
  anticipo,
  saldo,
  formaPago,
  fechaEntrega,
  horaEntrega,
  notas,
  items,
}: ReciboPDFProps) {
  const pagado = saldo <= 0;

  return (
    <Document title={`Recibo ${folioStr(folio)}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>IDEASQSOLUCIONAN</Text>
            <Text style={styles.brandSub}>|CORTE Y GRABADO CNC|</Text>
          </View>
          <View style={styles.folioBox}>
            <Text style={styles.folioText}>{folioStr(folio)}</Text>
            <Text style={styles.folioLabel}>RECIBO DE PEDIDO</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Cliente</Text>
            <Text style={styles.metaValue}>{clienteNombre || "—"}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Categoría</Text>
            <Text style={styles.metaValue}>{catLabel}</Text>
          </View>
          <View style={[styles.metaBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.metaLabel}>Fecha</Text>
            <Text style={styles.metaValue}>{fecha}</Text>
          </View>
        </View>

        {fechaEntrega && (
          <View style={[styles.metaRow, { marginBottom: 20 }]}>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Fecha de entrega</Text>
              <Text style={styles.metaValue}>
                {fechaEntrega}
                {horaEntrega ? `  ·  ${horaEntrega}` : ""}
              </Text>
            </View>
          </View>
        )}

        {/* Products table (multi-product orders) */}
        {items && items.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>Productos</Text>
            {items.map((item, i) => {
              const details = item.categoria && item.formSnapshot
                ? formatSnapshot(item.categoria, item.formSnapshot)
                : [];
              return (
                <View key={i}>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{item.catLabel}</Text>
                    <Text style={styles.rowVal}>{fmt(item.total)}</Text>
                  </View>
                  {details.length > 0 && (
                    <View style={styles.detailsGrid}>
                      {details.map((d, j) => (
                        <View key={j} style={styles.detailCell}>
                          <Text style={styles.detailLabel}>{d.label}</Text>
                          <Text style={styles.detailValue}>{d.value}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
            <View style={{ marginBottom: 20 }} />
          </>
        )}

        {/* Resumen de pago */}
        <Text style={styles.sectionTitle}>Resumen de pago</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total del pedido</Text>
          <Text style={styles.rowVal}>{fmt(total)}</Text>
        </View>

        {anticipo > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Anticipo recibido
              {formaPago ? ` (${FORMA_PAGO_LABELS[formaPago] ?? formaPago})` : ""}
            </Text>
            <Text style={styles.rowVal}>- {fmt(anticipo)}</Text>
          </View>
        )}

        {/* Saldo */}
        <View style={styles.saldoRow}>
          <Text style={styles.saldoLabel}>Saldo pendiente</Text>
          <Text style={pagado ? styles.saldoValOk : styles.saldoVal}>
            {pagado ? "PAGADO" : fmt(saldo)}
          </Text>
        </View>

        {pagado && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓  Pedido liquidado</Text>
          </View>
        )}

        {/* Notas */}
        {notas && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notas</Text>
            <Text style={styles.notesText}>{notas}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Recibo generado por IdeasQSolucionan · {fecha}
        </Text>
      </Page>
    </Document>
  );
}
