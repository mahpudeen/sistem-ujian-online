/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box, Heading, Text, Radio, Stack, Badge,
  RadioGroup, Spinner, Button, Flex
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import {
  getDoc, doc, getDocs, collection
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

export default function ReviewJawabanSiswa() {
  const { userId, ujianId } = useParams();
  const [jawabanData, setJawabanData] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navState, setNavState] = useState({ list: [], current: 0 });
  const navigate = useNavigate();
  const pdfRef = useRef();

  useEffect(() => {
    fetchData();
  }, [ujianId, userId]);

  const fetchData = async () => {
    setLoading(true);

    // Ambil dokumen jawaban siswa
    const jawabanSnap = await getDoc(doc(db, "jawaban", `${userId}_${ujianId}`));
    if (!jawabanSnap.exists()) {
      setLoading(false);
      return;
    }
    const data = jawabanSnap.data();

    // Ambil data user (nama + kelas)
    const userSnap = await getDoc(doc(db, "users", data.userId));
    const userData = userSnap.exists() ? userSnap.data() : {};

    const monitoringSnap = await getDocs(collection(db, "logUjianAktif", ujianId, "monitoring"));
    const siswaList = monitoringSnap.docs.map(doc => ({
      id: doc.id,
      nama: doc.data().nama || doc.id
    }));
    siswaList.sort((a, b) => a.nama.localeCompare(b.nama));

    const currentIndex = siswaList.findIndex(s => s.id === userId);
    setNavState({
      list: siswaList,
      current: currentIndex
    });

    // Ambil semua soal terkait
    const soalSnap = await getDocs(collection(db, "soal", data.soalId, "pertanyaan"));
    const soalMap = {};
    soalSnap.docs.forEach(doc => {
      soalMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    let totalBenar = 0;

    // Susun ulang soal berdasarkan soalOrder yang disimpan
    const ordered = (data.soalOrder || Object.keys(data.jawaban)).map(id => {
      const soal = soalMap[id];
      if (!soal) return null;

      const opsiMap = data.opsiMap?.[id] || soal.opsi.map((_, i) => i);
      const opsiAcak = opsiMap.map(i => soal.opsi[i]); // urut opsi ditampilkan

      const pilihan = data.jawaban?.[id]; // index acak yang dipilih siswa
      const jawabanBenar = soal.jawabanBenar; // index asli
      const indexBenarAcak = opsiMap.indexOf(jawabanBenar); // posisi benar di opsi yang ditampilkan

      // validasi jawaban
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

    const nilaiAkhir = Math.round((totalBenar / ordered.length) * 100);

    // Simpan data ke state
    setJawabanData({
      ...data,
      nama: userData.nama || data.userId,
      kelas: userData.kelas || "-",
      nilai: nilaiAkhir,
      benar: totalBenar
    });

    setPertanyaanList(ordered);
    setLoading(false);
  };

  const handleExportPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: `Review_${jawabanData.nama || "Siswa"}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading || !jawabanData) return <Spinner m={8} />;

  return (
    <Box p={6}>
      <Button colorScheme="teal" mb={4} onClick={handleExportPDF}>
        Export PDF
      </Button>

      <Box ref={pdfRef}>
        <Heading size="md" mb={4}>Review Jawaban Siswa</Heading>
        <Text mb={2}><strong>Nama:</strong> {jawabanData.nama || jawabanData.userId}</Text>
        <Text mb={2}><strong>Kelas:</strong> {jawabanData.kelas}</Text>
        <Text mb={4}><strong>Nilai:</strong> {jawabanData.nilai} (Benar {jawabanData.benar} dari {pertanyaanList.length})</Text>

        <Stack spacing={6}>
          {pertanyaanList.map((p, idx) => {
            const indexBenarAsli = p.jawabanBenar;
            const indexBenarAcak = p.opsiMap?.indexOf(indexBenarAsli);
            return (
              <Box key={p.id} p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="semibold" mb={2}>
                  {idx + 1}. {p.teks}
                </Text>
                <RadioGroup value={p.pilihanSiswa?.toString()}>
                  <Stack>
                    {p.opsi.map((opsi, i) => {
                      const isCorrect = i === indexBenarAcak;
                      const isChosen = i === p.pilihanSiswa;
                      return (
                        <Radio key={i} value={i.toString()} isDisabled>
                          <Text as="span" fontWeight={isCorrect ? "bold" : "normal"}>
                            {opsi}
                          </Text>
                          {isCorrect && <Badge ml={2} colorScheme="green">Benar</Badge>}
                          {isChosen && !isCorrect && <Badge ml={2} colorScheme="red">Jawaban Siswa</Badge>}
                          {isChosen && isCorrect && <Badge ml={2} colorScheme="green">✔ Dipilih</Badge>}
                        </Radio>
                      );
                    })}
                  </Stack>
                </RadioGroup>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Flex justify="space-between" my={4}>
          <Button
            isDisabled={navState.current <= 0}
            onClick={() => {
              const prevId = navState.list[navState.current - 1]?.id;
              if (prevId) navigate(`/guru/review/${ujianId}/${prevId}`);
            }}
          >
            ← Sebelumnya
          </Button>
          <Button
            isDisabled={navState.current >= navState.list.length - 1}
            onClick={() => {
              const nextId = navState.list[navState.current + 1]?.id;
              if (nextId) navigate(`/guru/review/${ujianId}/${nextId}`);
            }}
          >
            Berikutnya →
          </Button>
        </Flex>
    </Box>
  );
}
