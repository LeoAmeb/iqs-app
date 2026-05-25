import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface DesgloseRow {
  label: string;
  val: number;
}

interface CotizacionPDFProps {
  folio: number;
  fecha: string;
  catLabel: string;
  clienteNombre: string;
  rows: DesgloseRow[];
  total: number;
  costo: number;
  iva: number;
  ganancia: number;
  margen: number;
  fechaEntrega?: string | null;
  horaEntrega?: string | null;
  notas?: string | null;
}

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-MX");
}

function folioStr(n: number): string {
  return "#" + String(n).padStart(4, "0");
}

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
    paddingVertical: 5,
    borderBottom: "1 solid #f0f0f0",
  },
  rowLabel: {
    color: "#444",
    flex: 1,
  },
  rowVal: {
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "2 solid #111",
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  totalVal: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  ivaText: {
    fontSize: 8,
    color: "#777",
    marginTop: 4,
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
});

export function CotizacionPDF({
  folio,
  fecha,
  catLabel,
  clienteNombre,
  rows,
  total,
  costo,
  iva,
  ganancia,
  margen,
  fechaEntrega,
  horaEntrega,
  notas,
}: CotizacionPDFProps) {
  return (
    <Document title={`Cotización ${folioStr(folio)}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              IDEAS<Text style={{ fontFamily: "Helvetica-Bold" }}>QSOLUCIONAN</Text>
            </Text>
            <Text style={styles.brandSub}>|CORTE Y GRABADO CNC|</Text>
          </View>
          <View style={styles.folioBox}>
            <Text style={styles.folioText}>{folioStr(folio)}</Text>
            <Text style={styles.folioLabel}>COTIZACIÓN</Text>
          </View>
        </View>

        {/* Meta row */}
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

        {/* Desglose */}
        <Text style={styles.sectionTitle}>Desglose</Text>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowVal}>{fmt(row.val)}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalVal}>{fmt(total)}</Text>
        </View>
        <Text style={styles.ivaText}>IVA incluido: {fmt(iva)}</Text>

        {/* Notas */}
        {notas && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notas</Text>
            <Text style={styles.notesText}>{notas}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Cotización generada por IdeasQSolucionan · {fecha}
        </Text>
      </Page>
    </Document>
  );
}
