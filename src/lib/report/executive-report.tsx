import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DashboardPayload, IntelligencePayload } from "../types";
import { formatValue } from "../utils";

// Paleta Bispo (PDF não usa Tailwind — cores literais).
const GREEN = "#52623e";
const BLUE = "#00377e";
const INK = "#0f1411";
const MUTED = "#6b7280";
const BG = "#f4f5f2";

const s = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 40, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  cover: { backgroundColor: GREEN, padding: 40, paddingTop: 60, paddingBottom: 48, color: "#fff" },
  eyebrow: { fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" },
  coverTitle: { fontSize: 30, fontFamily: "Helvetica-Bold", marginTop: 8 },
  coverSub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 6 },
  body: { padding: 40, paddingTop: 28 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", color: GREEN, marginBottom: 10, marginTop: 18 },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpiCard: { width: "31.5%", borderWidth: 1, borderColor: "#e6e8e3", borderRadius: 8, padding: 10, backgroundColor: BG },
  kpiLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  kpiValue: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 3 },
  kpiDelta: { fontSize: 8, marginTop: 3 },
  scoreBox: { flexDirection: "row", alignItems: "center", gap: 16, borderWidth: 1, borderColor: "#e6e8e3", borderRadius: 10, padding: 16, marginBottom: 4 },
  scoreNum: { fontSize: 40, fontFamily: "Helvetica-Bold", color: GREEN },
  insight: { borderWidth: 1, borderColor: "#e6e8e3", borderRadius: 8, padding: 12, marginBottom: 8 },
  insightTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  label: { fontSize: 8, color: MUTED, textTransform: "uppercase", marginTop: 5 },
  rec: { flexDirection: "row", gap: 8, marginBottom: 6 },
  recNum: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#fff", backgroundColor: GREEN, borderRadius: 9, width: 18, height: 18, textAlign: "center", paddingTop: 3 },
  footer: { position: "absolute", bottom: 18, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: MUTED, borderTopWidth: 1, borderTopColor: "#e6e8e3", paddingTop: 6 },
});

const STATUS_LABEL = { EXCELLENT: "Excelente", ATTENTION: "Atenção", CRITICAL: "Crítico" } as const;

export function ExecutiveReport({
  dash,
  intel,
  brand,
}: {
  dash: DashboardPayload;
  intel: IntelligencePayload;
  brand?: { name?: string; color?: string };
}) {
  const accent = brand?.color ?? GREEN;
  const agency = brand?.name ?? "Método Bispo Analytics";
  const headline = ["roas", "cpl", "leads", "spend", "ctr", "revenue"]
    .map((k) => dash.kpis.find((x) => x.key === k))
    .filter(Boolean) as DashboardPayload["kpis"];

  return (
    <Document title={`Relatório Executivo — ${dash.client.name}`} author={agency}>
      <Page size="A4" style={s.page}>
        {/* Capa */}
        <View style={[s.cover, { backgroundColor: accent }]}>
          <Text style={s.eyebrow}>Relatório Executivo · {agency}</Text>
          <Text style={s.coverTitle}>{dash.client.name}</Text>
          <Text style={s.coverSub}>
            Período {dash.period.start} a {dash.period.end} · gerado pela Bispo IA
          </Text>
        </View>

        <View style={s.body}>
          {/* Score */}
          <View style={s.scoreBox}>
            <Text style={[s.scoreNum, { color: accent }]}>{intel.score.overall}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 }}>
                Score Bispo — {STATUS_LABEL[intel.score.status]}
              </Text>
              <Text style={{ color: MUTED, marginTop: 3, lineHeight: 1.4 }}>{intel.score.reasoning}</Text>
              <Text style={{ marginTop: 5, fontSize: 9 }}>
                Conteúdo {intel.score.content} · Crescimento {intel.score.growth} · Tráfego{" "}
                {intel.score.traffic} · Conversão {intel.score.conversion} · Engajamento{" "}
                {intel.score.engagement}
              </Text>
            </View>
          </View>

          {/* KPIs */}
          <Text style={s.h2}>Indicadores-chave</Text>
          <View style={s.kpiRow}>
            {headline.map((k) => (
              <View key={k.key} style={s.kpiCard}>
                <Text style={s.kpiLabel}>{k.label}</Text>
                <Text style={s.kpiValue}>{formatValue(k.current, k.format)}</Text>
                <Text style={[s.kpiDelta, { color: k.isGood ? "#2f9e63" : "#cf3a3a" }]}>
                  {k.changePct >= 0 ? "+" : ""}
                  {k.changePct.toFixed(1)}% vs. período anterior
                </Text>
              </View>
            ))}
          </View>

          {/* Diagnósticos */}
          <Text style={s.h2}>Diagnósticos da Bispo IA</Text>
          {intel.insights.slice(0, 3).map((i) => (
            <View key={i.id} style={s.insight} wrap={false}>
              <Text style={s.insightTitle}>{i.metric}</Text>
              <Text style={s.label}>O QUÊ</Text>
              <Text>{i.what}</Text>
              <Text style={s.label}>POR QUÊ</Text>
              <Text>{i.why}</Text>
              <Text style={s.label}>IMPACTO</Text>
              <Text>{i.impact}</Text>
              <Text style={[s.label, { color: accent }]}>O QUE FAZER</Text>
              <Text style={{ color: accent, fontFamily: "Helvetica-Bold" }}>{i.action}</Text>
            </View>
          ))}

          {/* Recomendações */}
          <Text style={s.h2}>Recomendações priorizadas</Text>
          {intel.recommendations.slice(0, 4).map((r) => (
            <View key={r.id} style={s.rec} wrap={false}>
              <Text style={[s.recNum, { backgroundColor: accent }]}>{r.priority}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  [{r.channel}] {r.title}
                </Text>
                <Text style={{ color: MUTED, marginTop: 2 }}>{r.body}</Text>
                <Text style={{ color: BLUE, marginTop: 2, fontSize: 8 }}>Impacto {r.impactScore}/100</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text>{agency}</Text>
          <Text>{dash.client.name} · {dash.period.end}</Text>
        </View>
      </Page>
    </Document>
  );
}
