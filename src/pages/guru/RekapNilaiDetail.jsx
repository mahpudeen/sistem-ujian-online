import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Tag, Flex,
  Button, IconButton, Tooltip, Select
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AiOutlineEye } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";

export default function RekapNilaiDetail() {
  const { user } = useAuth();

  const { ujianId } = useParams();
  const [ujian, setUjian] = useState(null);
  const [rekapList, setRekapList] = useState([]);
  const [jumlahSoal, setJumlahSoal] = useState(0);
  const [kelasFilter, setKelasFilter] = useState("Semua");

  useEffect(() => {
    fetchData();
  }, [ujianId]);

  const fetchData = async () => {
    const ujianSnap = await getDoc(doc(db, "ujianAktif", ujianId));
    if (!ujianSnap.exists()) return;

    const ujianData = ujianSnap.data();
    setUjian(ujianData);

    const soalSnap = await getDocs(collection(db, "soal", ujianData.soalId, "pertanyaan"));
    const kunciMap = {};
    soalSnap.docs.forEach(doc => {
      kunciMap[doc.id] = doc.data().jawabanBenar;
    });
    setJumlahSoal(soalSnap.docs.length);

    const userSnap = await getDocs(collection(db, "users"));
    const userMap = {};
    userSnap.docs.forEach(u => {
      const data = u.data();
      if (data.role === "siswa") {
        userMap[u.id] = {
          nama: data.nama,
          kelas: data.kelas,
          nis: data.nis,
        };
      }
    });

    const jawabanSnap = await getDocs(collection(db, "jawaban"));
    const hasil = [];

    jawabanSnap.docs.forEach(docSnap => {
      const d = docSnap.data();
      if (d.ujianId !== ujianId) return;

      const jawabanSiswa = d.jawaban || {};
      const opsiMap = d.opsiMap || {};
      const soalOrder = d.soalOrder || Object.keys(jawabanSiswa);

      let benar = 0;

      soalOrder.forEach((pertanyaanId) => {
        const pilihanIndexAcak = jawabanSiswa[pertanyaanId];
        const mapping = opsiMap[pertanyaanId];
        const indexAsli = mapping ? mapping[pilihanIndexAcak] : null;
        const kunci = kunciMap[pertanyaanId];

        if (indexAsli != null && indexAsli === kunci) {
          benar++;
        }
      });

      hasil.push({
        userId: d.userId,
        nama: userMap[d.userId]?.nama || "(tidak ditemukan)",
        kelas: userMap[d.userId]?.kelas || "-",
        nis: userMap[d.userId]?.nis || "-",
        nilai: Math.round((benar / soalSnap.docs.length) * 100),
        benar,
        submitAt: d.waktuSubmit?.seconds ? new Date(d.waktuSubmit.seconds * 1000) : null,
        published: d.published || false
      });
    });

    setRekapList(hasil);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Rekap Nilai - ${ujian?.soalNama || ""}`, 14, 16);
    const tableData = filteredList.map(r => [
      r.nis, r.nama, r.kelas, r.nilai, r.benar, jumlahSoal,
      r.submitAt ? format(r.submitAt, "dd/MM/yyyy HH:mm") : "-"
    ]);
    autoTable(doc, {
      head: [["NIS", "Nama", "Kelas", "Nilai", "Benar", "Soal", "Waktu Submit"]],
      body: tableData,
      startY: 22
    })
    doc.save(`Rekap-Nilai-${ujian?.soalKode}.pdf`);
  };

  const exportExcel = () => {
    const data = filteredList.map(r => ({
      NIS: r.nis,
      Nama: r.nama,
      Kelas: r.kelas,
      Nilai: r.nilai,
      Benar: r.benar,
      "Jumlah Soal": jumlahSoal,
      "Waktu Submit": r.submitAt ? format(r.submitAt, "dd/MM/yyyy HH:mm") : "-",
      Status: r.published ? "Dipublikasikan" : "Draft"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Nilai");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Rekap-Nilai-${ujian?.soalKode}.xlsx`);
  };

  const publishNilai = async () => {
    const snap = await getDocs(collection(db, "jawaban"));
    const batch = snap.docs.filter(d => d.data().ujianId === ujianId);

    for (const docSnap of batch) {
      await updateDoc(doc(db, "jawaban", docSnap.id), { published: true });
    }

    fetchData();
  };

  const filteredList = rekapList.filter(r => {
    return kelasFilter === "Semua" || r.kelas === kelasFilter;
  });

  const kelasUnik = ["Semua", ...new Set(rekapList.map(r => r.kelas))];

  return (
    <Box p={6}>
      <Heading mb={2}>Rekap Nilai</Heading>
      {ujian && (
        <Text fontSize="lg" mb={4}>
          <strong>{ujian.soalNama}</strong> - {ujian.soalKode}
        </Text>
      )}

      <Flex gap={3} mb={4} wrap="wrap">
        <Select
          value={kelasFilter}
          onChange={(e) => setKelasFilter(e.target.value)}
          maxW="200px"
        >
          {kelasUnik.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </Select>

        <Button onClick={exportPDF} colorScheme="red">Export PDF</Button>
        <Button onClick={exportExcel} colorScheme="green">Export Excel</Button>
        <Button onClick={publishNilai} colorScheme="blue">Publikasikan Nilai</Button>
      </Flex>

      <Table>
        <Thead>
          <Tr>
            <Th>NIS</Th>
            <Th>Nama</Th>
            <Th>Kelas</Th>
            <Th>Nilai</Th>
            <Th>Benar</Th>
            <Th>Jumlah Soal</Th>
            <Th>Waktu Submit</Th>
            <Th>Status</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredList.map((r, i) => (
            <Tr key={i}>
              <Td>{r.nis}</Td>
              <Td>{r.nama}</Td>
              <Td>{r.kelas}</Td>
              <Td><Text fontWeight="bold">{r.nilai}</Text></Td>
              <Td>{r.benar}</Td>
              <Td>{jumlahSoal}</Td>
              <Td>{r.submitAt ? format(r.submitAt, "dd/MM/yyyy HH:mm") : "-"}</Td>
              <Td>
                {r.published ? <Tag colorScheme="green">Dipublikasikan</Tag> : <Tag colorScheme="gray">Draft</Tag>}
              </Td>
              <Td>
                <Tooltip label="Lihat Jawaban">
                  <IconButton
                    as={Link}
                    to={`/${user.role}/review/${ujianId}/${r.userId}`}
                    icon={<AiOutlineEye />}
                    colorScheme="blue"
                    size="sm"
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
