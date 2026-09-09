"use client";

import jsPDF from "jspdf";
import type {
  ApprovalProject, ApprovalRevision, ApprovalChangeRequest,
  ApprovalImageComment, ApprovalAccessLog,
} from "@/lib/approvals";
import { STATUS_LABELS, CR_STATUS_LABELS, CATEGORY_LABELS, formatCurrency } from "@/lib/approvals";

interface ExportData {
  project: ApprovalProject;
  revisions: ApprovalRevision[];
  changeRequests: ApprovalChangeRequest[];
  imageComments: ApprovalImageComment[];
  accessLogs?: ApprovalAccessLog[];
  settings?: {
    brand_name?: string;
    pix_key?: string | null;
    pix_recipient_name?: string | null;
    whatsapp_for_receipts?: string | null;
  } | null;
}

/**
 * Gera PDF do histórico completo do projeto.
 * Pode ser chamado pelo admin ou pelo cliente.
 */
export function exportProjectToPDF(data: ExportData) {
  const { project, revisions, changeRequests, imageComments, accessLogs, settings } = data;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Helper: quebra de página
  const checkPage = () => {
    if (y > pageH - margin - 30) {
      doc.addPage();
      y = margin;
    }
  };

  // Helper: escreve texto com quebra automática
  const writeText = (text: string, opts?: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number; indent?: number }) => {
    const size = opts?.size ?? 10;
    const bold = opts?.bold ?? false;
    const color = opts?.color ?? [40, 40, 40];
    const gap = opts?.gap ?? 6;
    const indent = opts?.indent ?? 0;

    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentW - indent) as string[];
    for (const line of lines) {
      checkPage();
      doc.text(line, margin + indent, y);
      y += size + 2;
    }
    y += gap;
  };

  const writeSectionTitle = (title: string) => {
    checkPage();
    y += 10;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 12, contentW, 24, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(title, margin + 8, y + 4);
    y += 22;
  };

  // ============ CABEÇALHO ============
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, pageW, 90, "F");

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(settings?.brand_name || "Clodoaldo Silva", margin, 38);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("Portal de Aprovação de Projetos", margin, 56);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Relatório gerado em ${new Date().toLocaleString("pt-BR")}`, margin, 72);

  y = 110;

  // ============ TÍTULO DO PROJETO ============
  writeText(project.project_title, { size: 18, bold: true, gap: 4 });
  writeText(`Cliente: ${project.client_name}`, { size: 11, gap: 2 });
  if (project.client_email) writeText(`Email: ${project.client_email}`, { size: 10, gap: 2 });
  if (project.client_whatsapp) writeText(`WhatsApp: ${project.client_whatsapp}`, { size: 10, gap: 2 });
  writeText(`Status: ${STATUS_LABELS[project.status]}`, { size: 10, color: [80, 80, 80], gap: 2 });
  writeText(`Criado em: ${new Date(project.created_at).toLocaleString("pt-BR")}`, { size: 10, color: [120, 120, 120], gap: 2 });
  if (project.sent_at) writeText(`Enviado em: ${new Date(project.sent_at).toLocaleString("pt-BR")}`, { size: 10, color: [120, 120, 120], gap: 2 });
  if (project.approved_at) writeText(`Aprovado em: ${new Date(project.approved_at).toLocaleString("pt-BR")}`, { size: 10, color: [16, 185, 129], gap: 2 });

  y += 6;

  // ============ ESCOPO ============
  if (project.project_scope) {
    writeSectionTitle("Escopo do Projeto");
    writeText(project.project_scope, { size: 10, gap: 4 });
  }

  if (project.out_of_scope_examples) {
    writeSectionTitle("Fora do Escopo (pode gerar custo adicional)");
    writeText(project.out_of_scope_examples, { size: 10, color: [180, 100, 0], gap: 4 });
  }

  // ============ NOTAS DO PROFISSIONAL ============
  if (project.notes_for_client) {
    writeSectionTitle("Mensagem do Profissional");
    writeText(project.notes_for_client, { size: 10, gap: 4 });
  }

  // ============ REVISÕES ============
  if (revisions.length > 0) {
    writeSectionTitle(`Revisões (${revisions.length})`);
    revisions.forEach((r, i) => {
      writeText(`Revisão #${r.revision_number}`, { size: 11, bold: true, gap: 2 });
      writeText(`Enviada em: ${new Date(r.sent_at).toLocaleString("pt-BR")}`, { size: 9, color: [120, 120, 120], gap: 2, indent: 10 });
      if (r.preview_url) writeText(`Preview: ${r.preview_url}`, { size: 9, color: [0, 100, 200], gap: 2, indent: 10 });
      if (r.notes) writeText(`Notas: ${r.notes}`, { size: 9, gap: 2, indent: 10 });
      if (r.images && r.images.length > 0) {
        writeText(`Imagens anexas: ${r.images.length}`, { size: 9, color: [120, 120, 120], gap: 2, indent: 10 });
        r.images.forEach((img, idx) => {
          writeText(`${idx + 1}. ${img}`, { size: 8, color: [100, 100, 100], gap: 1, indent: 20 });
        });
      }
      if (r.approved_at) writeText(`Aprovada em: ${new Date(r.approved_at).toLocaleString("pt-BR")}`, { size: 9, color: [16, 185, 129], gap: 6, indent: 10 });
      else writeText("", { size: 8, gap: 4 });
    });
  }

  // ============ PEDIDOS DE ALTERAÇÃO ============
  if (changeRequests.length > 0) {
    writeSectionTitle(`Pedidos de Alteração (${changeRequests.length})`);
    changeRequests.forEach((cr, i) => {
      writeText(`#${i + 1} — ${CR_STATUS_LABELS[cr.status]} (${CATEGORY_LABELS[cr.category]})`, { size: 10, bold: true, gap: 2 });
      writeText(`Cliente: ${cr.client_message}`, { size: 9, gap: 2, indent: 10 });
      if (cr.admin_response) writeText(`Resposta: ${cr.admin_response}`, { size: 9, color: [80, 80, 80], gap: 2, indent: 10 });
      if (cr.has_extra_cost) {
        writeText(`Custo adicional: ${formatCurrency(Number(cr.extra_cost_amount) * 100 || 0)}`, { size: 9, color: [200, 100, 0], gap: 1, indent: 10 });
        if (cr.extra_cost_reason) writeText(`Motivo: ${cr.extra_cost_reason}`, { size: 9, color: [120, 120, 120], gap: 1, indent: 10 });
      }
      if (cr.payment_status === "confirmed") writeText(`Pagamento confirmado`, { size: 9, color: [16, 185, 129], gap: 1, indent: 10 });
      writeText(`Criado em: ${new Date(cr.created_at).toLocaleString("pt-BR")}`, { size: 8, color: [150, 150, 150], gap: 8, indent: 10 });
    });
  }

  // ============ COMENTÁRIOS EM IMAGENS ============
  if (imageComments.length > 0) {
    writeSectionTitle(`Comentários em Imagens (${imageComments.length})`);
    imageComments.forEach((c, i) => {
      writeText(`#${i + 1} — por ${c.author_role === "admin" ? "Profissional" : "Cliente"}${c.is_resolved ? " (resolvido)" : ""}`, { size: 10, bold: true, gap: 2 });
      writeText(`Comentário: ${c.comment}`, { size: 9, gap: 1, indent: 10 });
      writeText(`Posição: X=${(Number(c.x_percent) * 100).toFixed(0)}% Y=${(Number(c.y_percent) * 100).toFixed(0)}% — Imagem #${c.image_index + 1}`, { size: 8, color: [150, 150, 150], gap: 6, indent: 10 });
    });
  }

  // ============ LOG DE ACESSOS ============
  if (accessLogs && accessLogs.length > 0) {
    writeSectionTitle(`Log de Acessos (${accessLogs.length} últimos)`);
    accessLogs.slice(0, 30).forEach((log) => {
      writeText(`${new Date(log.accessed_at).toLocaleString("pt-BR")} — IP: ${log.ip_address || "-"} — UA: ${(log.user_agent || "").substring(0, 80)}`, { size: 8, color: [150, 150, 150], gap: 2 });
    });
  }

  // ============ RODAPÉ em todas as páginas ============
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${settings?.brand_name || "Clodoaldo Silva"} — Portal de Aprovação — Página ${i} de ${totalPages}`,
      margin,
      pageH - 20,
    );
  }

  // Salva o PDF
  const fileName = `projeto-${project.project_title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 40)}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
