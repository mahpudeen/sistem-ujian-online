import {
  Box, Heading, Text, Stack, Spinner, useToast, Button
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import {
  getDoc, doc, getDocs, collection
} from "firebase/firestore";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

export default function ReviewUjianSiswa() {
  const { ujianId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const pdfRef = useRef();

  const [jawabanData, setJawabanData] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid && ujianId) fetchData();
  }, [user, ujianId]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const jawabSnap = await getDoc(doc(db, "jawaban", `${user.uid}_${ujianId}`));
      if (!jawabSnap.exists()) {
        toast({ title: "Data jawaban tidak ditemukan", status: "error" });
        setLoading(false);
        return;
      }

      const data = jawabSnap.data();

      // Ambil soal terkait
      const soalSnap = await getDocs(collection(db, "soal", data.soalId, "pertanyaan"));
      const soalMap = {};
      soalSnap.docs.forEach(doc => {
        soalMap[doc.id] = { id: doc.id, ...doc.data() };
      });

      // Hitung nilai
      let totalBenar = 0;
      const ordered = (data.soalOrder || Object.keys(data.jawaban || {})).map(id => {
        const soal = soalMap[id];
        if (!soal) return null;

        const opsiMap = data.opsiMap?.[id] || soal.opsi.map((_, i) => i);
        const opsiAcak = opsiMap.map(i => soal.opsi[i]);
        const jawabanBenar = soal.jawabanBenar;
        const pilihan = data.jawaban?.[id];
        const indexBenarAcak = opsiMap.indexOf(jawabanBenar);

        if (pilihan != null && opsiMap[pilihan] === jawabanBenar) {
          totalBenar++;
        }

        return {
          id,
          teks: soal.teks,
          opsi: opsiAcak,
          jawabanBenar,
          indexBenarAcak,
          pilihanSiswa: pilihan,
          opsiMap
        };
      }).filter(Boolean);
      const soalDoc = await getDoc(doc(db, "soal", data.soalId));
      const soalInfo = soalDoc.exists() ? soalDoc.data() : {};

      console.log(totalBenar)

      setJawabanData({
        kode: soalInfo.kode || "(tanpa kode)",
        namaSoal: soalInfo.nama || "(tanpa nama)",
        nilai: Math.round((totalBenar / ordered.length) * 100),
        benar: totalBenar,
        total: ordered.length
      });

      setPertanyaanList(ordered);
    } catch (err) {
      toast({ title: "Gagal memuat data", description: err.message, status: "error" });
    }

    setLoading(false);
  };

  const handleExportPDF = () => {
    if (!pdfRef.current) return;
    html2pdf().set({
      margin: 0.5,
      filename: `Review_${jawabanData.namaSoal || "Ujian"}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' }
    }).from(pdfRef.current).save();
  };

  if (loading) return <Spinner m={8} />;

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Button colorScheme="teal" mb={4} onClick={handleExportPDF}>
        Export PDF
      </Button>
      <Box ref={pdfRef}>
        <Heading size="md" mb={4}>Review Ujian</Heading>
        <Text><strong>Kode:</strong> {jawabanData.kode}</Text>
        <Text><strong>Nama:</strong> {jawabanData.namaSoal}</Text>
        <Text>Nilai: <strong>{jawabanData.nilai}</strong> (Benar {jawabanData.benar}/{jawabanData.total})</Text>
        
        <Stack spacing={6} mt={6}>
          {pertanyaanList.map((p, idx) => (
            <Box key={p.id} p={4} borderWidth="1px" borderRadius="md">
              <Text fontWeight="semibold" mb={2}>
                {idx + 1}. {p.teks}
              </Text>
              <Stack pl={4}>
                {p.opsi.map((opsi, i) => {
                  const isBenar = i === p.indexBenarAcak;
                  const isDipilih = i === p.pilihanSiswa;
                  return (
                    <Text key={i}>
                      {isDipilih ? "👉" : "▫"} {opsi}
                      {isBenar && <strong> ✔</strong>}
                      {isDipilih && !isBenar && <span style={{ color: 'red' }}> ❌</span>}
                    </Text>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
