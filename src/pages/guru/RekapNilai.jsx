/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box, Heading, Select, Table, Thead, Tbody, Tr, Th, Td, Text, Button
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function RekapNilai() {
  const [ujianList, setUjianList] = useState([]);
  const [ujianId, setUjianId] = useState("");
  const [ujianName, setUjianName] = useState("");
  const [rekapList, setRekapList] = useState([]);
  const [jumlahSoal, setJumlahSoal] = useState(0);

  useEffect(() => {
    fetchUjian();
  }, []);

  const fetchUjian = async () => {
    const snap = await getDocs(collection(db, "ujianAktif"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUjianList(list);
  };

  useEffect(() => {
    if (!ujianId) return;
    fetchRekap();
  }, [ujianId]);

  const fetchRekap = async () => {
    const ujian = ujianList.find(u => u.id === ujianId);
    if (!ujian) return;
  
    // Ambil kunci jawaban
    const pertanyaanSnap = await getDocs(collection(db, "soal", ujian.soalId, "pertanyaan"));
    const kunciMap = {};
    pertanyaanSnap.docs.forEach(doc => {
      kunciMap[doc.id] = doc.data().jawabanBenar;
    });
    setJumlahSoal(pertanyaanSnap.docs.length);
  
    // Ambil user siswa sekali saja
    const userSnap = await getDocs(collection(db, "users"));
    const userMap = {};
    userSnap.docs.forEach(u => {
      const data = u.data();
      if (data.role === "siswa") {
        userMap[u.id] = {
          nama: data.nama,
          kelas: data.kelas
        };
      }
    });

    // Ambil jawaban siswa
    const jawabanSnap = await getDocs(collection(db, "jawaban"));
    const hasil = [];
  
    jawabanSnap.docs.forEach(docSnap => {
      const d = docSnap.data();
      if (d.ujianId !== ujianId) return;
  
      const jawabanSiswa = d.jawaban || {};
      const opsiMap = d.opsiMap || {};
      const soalOrder = d.soalOrder || Object.keys(jawabanSiswa); // fallback: semua id
      
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
        nilai: Math.round((benar / pertanyaanSnap.docs.length) * 100),
        benar,
        submitAt: d.waktuSubmit?.seconds ? new Date(d.waktuSubmit.seconds * 1000) : null,
        published: d.published || false
      });
    });
  
    setRekapList(hasil);
  };

  const exportExcel = () => {
    const data = rekapList.map(r => ({
      Nama: r.nama,
      Kelas: r.kelas,
      Nilai: r.nilai,
      Benar: r.benar,
      Soal: jumlahSoal,
      "Waktu Submit": r.submitAt ? format(r.submitAt, "dd/MM/yyyy HH:mm") : "-",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Nilai");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Rekap-Nilai-${ujianName}.xlsx`);
  };  
  
  const handleSetUjianId = (e) => {
    const selectedIndex = e.target.selectedIndex;
    const selectedOption = e.target.options[selectedIndex];
  
    const value = e.target.value;
    const label = selectedOption.text;
  
    setUjianId(value);
    setUjianName(label);
  };  
  

  return (
    <Box p={6}>
      <Heading mb={4}>Rekap Nilai</Heading>

      <Select
        placeholder="Pilih Ujian"
        value={ujianId}
        onChange={handleSetUjianId}
        mb={4}
      >
        {ujianList.map((u) => (
          <option key={u.id} value={u.id}>
            {u.soalKode} - {u.kelas.join(", ")}
          </option>
        ))}
      </Select>

      {rekapList.length > 0 && (
        <>
          <Button colorScheme="blue" mb={4} onClick={exportExcel}>Export ke Excel</Button>
          <Table>
            <Thead>
              <Tr>
                <Th>Nama</Th>
                <Th>Kelas</Th>
                <Th>Nilai</Th>
                <Th>Benar</Th>
                <Th>Jumlah Soal</Th>
                <Th>Waktu Submit</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rekapList.map((r, i) => (
                <Tr key={i}>
                  <Td>{r.nama}</Td>
                  <Td>{r.kelas}</Td>
                  <Td><Text fontWeight="bold">{r.nilai}</Text></Td>
                  <Td>{r.benar}</Td>
                  <Td>{jumlahSoal}</Td>
                  <Td>{r.submitAt ? format(r.submitAt, "dd/MM/yyyy HH:mm") : "-"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Box>
  );
}
