type Severity = "Low" | "Medium" | "High" | "Unknown";

export function getSeverity(crimeName: string): Severity {
    const high = [
        "Pembunuhan",
        "Perkosaan",
        "Penculikan",
        "Pembakaran",
        "Kebakaran / Meletus",
        "Curas",
        "Curanmor",
        "Lahgun Senpi/Handak/Sajam",
        "Trafficking In Person",
    ];

    const medium = [
        "Penganiayaan Berat",
        "Penganiayaan Ringan",
        "Perjudian",
        "Sumpah Palsu",
        "Pemalsuan Materai",
        "Pemalsuan Surat",
        "Perbuatan Tidak Menyenangkan",
        "Premanisme",
        "Pemerasan Dan Pengancaman",
        "Penggelapan",
        "Penipuan",
        "Pengeroyokan",
        "PKDRT",
        "Money Loudering",
        "Illegal Logging",
        "Illegal Mining",
    ];

    const low = [
        "Member Suap",
        "Menerima Suap",
        "Penghinaan",
        "Perzinahan",
        "Terhadap Ketertiban Umum",
        "Membahayakan Kam Umum",
        "Kenakalan Remaja",
        "Perlindungan Anak",
        "Perlindungan TKI",
        "Perlindungan Saksi – Korban",
        "Pekerjakan Anak",
        "Pengrusakan",
        "ITE",
        "Perlindungan Konsumen",
    ];

    if (high.includes(crimeName)) return "High";
    if (medium.includes(crimeName)) return "Medium";
    if (low.includes(crimeName)) return "Low";
    return "Unknown";
}
