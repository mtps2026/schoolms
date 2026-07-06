// Client-only PDF generation for Transfer Certificates.
// Uses jsPDF and jsPDF-AutoTable to create a one-page clinical TC PDF.

const TC_CLASS_LABELS = ["Nur.", "J.K.G.", "S.K.G.", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function formatIndianDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

export async function generateTcPdf(tc: any): Promise<void> {
    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 9;
    const contentW = pageW - margin * 2;

    const schoolName =
        tc.schools?.school_name ||
        tc.students_data?.schools?.school_name ||
        "School Name";

    const studentName = (
        tc.students_data?.full_name ||
        tc.scholar_name ||
        "Student Name"
    ).toUpperCase();

    const fileYear =
        tc.dated
            ? new Date(tc.dated).getFullYear().toString()
            : tc.created_at
            ? new Date(tc.created_at).getFullYear().toString()
            : "Year";

    doc.setDrawColor(0);
    doc.setTextColor(0);

    // =====================================================================
    // WATERMARK — centered logo at low opacity via canvas (reliable cross-env)
    // =====================================================================
    try {
        const wmSize = 90;
        const wmX = (pageW - wmSize) / 2;
        const wmY = (pageH - wmSize) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const img = new Image();
            await new Promise<void>((resolve) => {
                img.onload = () => {
                    ctx.clearRect(0, 0, 300, 300);
                    ctx.globalAlpha = 0.08;
                    ctx.drawImage(img, 0, 0, 300, 300);
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = "/image.png";
            });
            const dataUrl = canvas.toDataURL("image/png");
            doc.addImage(dataUrl, "PNG", wmX, wmY, wmSize, wmSize);
        }
    } catch (e) {}

    let y = 12;

    // =====================================================================
    // ROW 1: Admission No (left) | Withdrawal No (center) | TC File No (right)
    // =====================================================================
    doc.setFont("times", "bold");
    doc.setFontSize(7);

    // Admission File No — left
    doc.text("Admission File No.", margin, y);
    doc.line(margin + 28, y + 0.5, margin + 62, y + 0.5);
    doc.setFont("times", "normal");
    doc.text(tc.admission_file_no || "", margin + 30, y);

    // Withdrawal File No — center
    doc.setFont("times", "bold");
    doc.text("Withdrawal File No.", pageW / 2 - 24, y);
    doc.line(pageW / 2 + 8, y + 0.5, pageW / 2 + 42, y + 0.5);
    doc.setFont("times", "normal");
    doc.text(tc.withdrawal_file_no || "", pageW / 2 + 10, y);

    // TC File No — right
    doc.setFont("times", "bold");
    doc.text("TC File No.", pageW - margin - 38, y);
    doc.line(pageW - margin - 22, y + 0.5, pageW - margin, y + 0.5);
    doc.setFont("times", "normal");
    doc.text(tc.tc_file_no || "", pageW - margin - 21, y);

    // =====================================================================
    // ROW 2: Aadhar No (left) | Title line 1 (center) | Register No (right)
    // =====================================================================
    // CHANGED: was y += 5, now y += 6 for more breathing room between ID rows
    y += 6;

    // Aadhar — left
    doc.setFont("times", "bold");
    doc.setFontSize(7);
    doc.text("Aadhar No.", margin, y);
    doc.line(margin + 18, y + 0.5, margin + 62, y + 0.5);
    doc.setFont("times", "normal");
    doc.text(tc.aadhar_number || "", margin + 20, y);

    // Register No — right
    doc.setFont("times", "bold");
    doc.text("Register No.", pageW - margin - 38, y);
    doc.line(pageW - margin - 22, y + 0.5, pageW - margin, y + 0.5);
    doc.setFont("times", "normal");
    doc.text(tc.scholar_register_no || "", pageW - margin - 21, y);

    // Title line 1 — centered vertically with row 2, with more spacing from top
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Scholar's Register &", pageW / 2, y + 3, { align: "center" });

    // =====================================================================
    // ROW 3: PEN No (left) | Title line 2 (center) | APAR ID (right)
    // =====================================================================
    // CHANGED: was y += 5, now y += 6 for more breathing room between ID rows
    y += 6;

    // PEN No — left
    doc.setFont("times", "bold");
    doc.setFontSize(7);
    doc.text("PEN No.", margin, y);
    doc.line(margin + 18, y + 0.5, margin + 62, y + 0.5);
    doc.setFont("times", "normal");
    doc.text(tc.pan_number || "", margin + 20, y);

    // APAR ID — right
    doc.setFont("times", "bold");
    doc.text("APAAR ID", pageW - margin - 38, y);
    doc.line(pageW - margin - 22, y + 0.5, pageW - margin, y + 0.5);
    doc.setFont("times", "normal");
    doc.text(tc.apar_number || "", pageW - margin - 21, y);

    // Title line 2 — centered vertically with row 3, with more spacing from top
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Transfer Certificate Form", pageW / 2, y + 3, { align: "center" });

    y += 5;

    // =====================================================================
    // ROW 3: LOGO left-aligned at margin; SCHOOL NAME + ADDRESS centered
    // =====================================================================
    const logoH = 16;
    const logoW = 16;
    // CHANGED: was 15, now 14 — slightly smaller school name to save vertical space
    const schoolFontSize = 14;
    const addressFontSize = 7;

    // Draw logo — pinned to left margin
    try {
        doc.addImage("/image.png", "PNG", margin, y, logoW, logoH);
    } catch (e) {}

    // School name — centered on full page width, vertically mid of logo
    doc.setFont("times", "bold");
    doc.setFontSize(schoolFontSize);
    const schoolText = schoolName.toUpperCase();
    doc.text(schoolText, pageW / 2, y + logoH / 2, { align: "center" });

    // Address lines — centered below school name
    y += logoH + 1;
    doc.setFont("times", "normal");
    doc.setFontSize(addressFontSize);
    doc.text(
        "Moh. Jawahar Nagar, Khadgujar Road, Gajraula, Distt. Amroha (U.P.)",
        pageW / 2,
        y,
        { align: "center" }
    );
    y += 4;
    doc.text("Contact: 9997024689", pageW / 2, y, { align: "center" });

    y += 4;

    // =====================================================================
    // DETAILS TABLE
    // =====================================================================
    const detailsBody: any[][] = [
        [
            { content: "Scholar's Name", styles: { fontStyle: "bold", fontSize: 7 } },
            { content: "Father's / Guardian's name & Address", styles: { fontStyle: "bold", fontSize: 7 } },
            { content: "Last Institution attended before joining this one if any", styles: { fontStyle: "bold", fontSize: 7 } },
        ],
        [
            // CHANGED: fontSize 7 → 8 for student name row — more legible on print
            { content: studentName, styles: { fontSize: 8, fontStyle: "bold" } },
            {
                content: `${tc.father_guardian_name || "—"}\n${tc.father_guardian_address || "—"}`,
                // CHANGED: fontSize 7 → 8 for father/address row
                styles: { fontSize: 8 },
            },
            // CHANGED: fontSize 7 → 8 for last institution row
            { content: tc.last_institution_before || "—", styles: { fontSize: 8 } },
        ],
        [
            { content: "Caste or Religion", styles: { fontStyle: "bold", fontSize: 7 } },
            { content: "Mother's Name", styles: { fontStyle: "bold", fontSize: 7 } },
            { content: "Length of Residence in this Province", styles: { fontStyle: "bold", fontSize: 7 } },
        ],
        [
            // CHANGED: fontSize 7 → 8 for caste/religion value row
            { content: tc.caste_or_religion || "—", styles: { fontSize: 8 } },
            // CHANGED: fontSize 7 → 8 for mother name value row
            { content: tc.mother_name || "—", styles: { fontSize: 8 } },
            // CHANGED: fontSize 7 → 8 for length of residence value row
            { content: tc.length_of_residence || "—", styles: { fontSize: 8 } },
        ],
    ];

    autoTable(doc, {
        startY: y,
        head: [],
        body: detailsBody,
        theme: "grid",
        margin: { left: margin, right: margin },
        tableWidth: contentW,
        styles: {
            font: "times",
            fontSize: 7,
            // CHANGED: top/bottom cellPadding 1 → 2 for taller, more readable rows
            cellPadding: { top: 2, right: 1.5, bottom: 2, left: 1.5 },
            lineWidth: 0.3,
            lineColor: [0, 0, 0],
            valign: "top",
            textColor: [0, 0, 0],
            overflow: "linebreak",
            fillColor: [255, 255, 255],
            // CHANGED: minCellHeight 5 → 7 for taller detail rows
            minCellHeight: 7,
        },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 80 },
            2: { cellWidth: contentW - 125 },
        },
    });

    y = ((doc as any).lastAutoTable?.finalY || y + 24) + 1;

    // =====================================================================
    // DOB BOX
    // =====================================================================
    doc.setLineWidth(0.3);
    doc.setDrawColor(0, 0, 0);
    // CHANGED: dobBoxH 11 → 14 for more vertical space in DOB field
    const dobBoxH = 14;
    doc.rect(margin, y, contentW, dobBoxH);

    doc.setFont("times", "bold");
    // CHANGED: fontSize 7 → 8 for DOB label — more legible when printed
    doc.setFontSize(8);
    doc.text(
        `Date of Birth of the Scholar (in figure & words): ${tc.dob ? formatIndianDate(tc.dob) : "—"}`,
        margin + 2,
        y + 5
    );
    if (tc.dob_in_words) {
        doc.setFont("times", "normal");
        // CHANGED: fontSize 7 → 8 for DOB in words
        doc.setFontSize(8);
        doc.text(`(${tc.dob_in_words})`, margin + 2, y + 10.5);
    }

    y += dobBoxH + 1;

    // =====================================================================
    // CALCULATE ROW HEIGHT to fill remaining page space
    // =====================================================================
    // CHANGED: footerY pageH - 18 → pageH - 22 for more footer/cert text space
    const footerY = pageH - 22;
    const certLineH = 6;
    // CHANGED: tableHeadH 13 → 11 — slightly tighter header to give rows more room
    const tableHeadH = 11;
    const availableForTableBody = footerY - certLineH - 4 - tableHeadH - y;
    const rowCount = TC_CLASS_LABELS.length;
    // CHANGED: Math.max(6, ...) → Math.max(5, ...) — allow rows to compress more
    const rowH = Math.max(5, availableForTableBody / rowCount);

    // =====================================================================
    // SCHOLAR'S REGISTER TABLE
    // =====================================================================
    const records = Array.isArray(tc.tc_academic_records) ? tc.tc_academic_records : [];

    const recordsByLabel = TC_CLASS_LABELS.reduce(
        (acc: Record<string, any>, label) => {
            acc[label] = records.find((r: any) => r.class_label === label) || {};
            return acc;
        },
        {} as Record<string, any>
    );

    autoTable(doc, {
        startY: y,
        head: [
            [
                { content: "Class" },
                { content: "Date of\nAdmission" },
                { content: "Date of\nPromotion" },
                { content: "Date of\nRemoval" },
                { content: "Cause of Removal e.g. non payment of dues, removal of family, expulsion etc." },
                { content: "Year of\nSession" },
                { content: "Conduct\nconcession\nif any less" },
                { content: "Work" },
                { content: "Signature" },
            ],
        ],
        body: TC_CLASS_LABELS.map((label) => {
            const rec = recordsByLabel[label] || {};
            return [
                label,
                rec.date_of_admission ? new Date(rec.date_of_admission).toLocaleDateString("en-IN") : "",
                rec.date_of_promotion ? new Date(rec.date_of_promotion).toLocaleDateString("en-IN") : "",
                rec.date_of_removal ? new Date(rec.date_of_removal).toLocaleDateString("en-IN") : "",
                rec.cause_of_removal || "",
                rec.year_session || "",
                rec.conduct || "",
                rec.work || "",
                rec.signature || "",
            ];
        }),
        theme: "grid",
        margin: { left: margin, right: margin },
        tableWidth: contentW,
        pageBreak: "avoid",
        styles: {
            font: "times",
            // CHANGED: fontSize 6.5 → 6 — slightly smaller to help compress table
            fontSize: 6,
            // CHANGED: top/bottom cellPadding 1 → 0.5 — tighter rows in register table
            cellPadding: { top: 0.5, right: 1, bottom: 0.5, left: 1 },
            minCellHeight: rowH,
            lineWidth: 0.3,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
            valign: "middle",
            halign: "center",
            overflow: "linebreak",
            fillColor: [255, 255, 255],
        },
        headStyles: {
            font: "times",
            fontStyle: "bold",
            // CHANGED: fontSize 6 → 5.5 — tighter header text to allow smaller header height
            fontSize: 5.5,
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineWidth: 0.3,
            lineColor: [0, 0, 0],
            halign: "center",
            valign: "middle",
            // CHANGED: minCellHeight 13 → 11 — shorter header row
            minCellHeight: tableHeadH,
        },
        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 18 },
            2: { cellWidth: 18 },
            3: { cellWidth: 18 },
            4: { cellWidth: 44 },
            5: { cellWidth: 16 },
            6: { cellWidth: 18 },
            7: { cellWidth: 14 },
            8: { cellWidth: contentW - 158 },
        },
    });

    const tableEndY = (doc as any).lastAutoTable?.finalY || y + 55;

    // =====================================================================
    // CERTIFICATION TEXT — centered, immediately after table
    // =====================================================================
    const remarks =
        tc.certification_remarks ||
        "Certified that the above Scholar's Register has been, posted up-to-date of the Scholar's leaving as required by the Departmental Rules.";

    doc.setFont("times", "normal");
    // CHANGED: fontSize 6.5 → 7 — slightly larger cert text, easier to read
    doc.setFontSize(7);
    const remarkLines = doc.splitTextToSize(remarks, contentW - 2);
    doc.text(remarkLines, pageW / 2, tableEndY + 4, { align: "center" });

    // =====================================================================
    // FOOTER — fixed at page bottom, no P.T.O.
    // =====================================================================
    doc.setFont("times", "normal");
    // CHANGED: fontSize 8 → 9 — larger, bolder-looking date and signature label
    doc.setFontSize(9);
    doc.text(`Dated: ${tc.dated ? formatIndianDate(tc.dated) : ""}`, margin, footerY);
    doc.text("Head of Institution", pageW - margin, footerY, { align: "right" });

    const fileName = `TC_${studentName.replace(/\s+/g, "_")}_${fileYear}.pdf`;
    doc.save(fileName);
}