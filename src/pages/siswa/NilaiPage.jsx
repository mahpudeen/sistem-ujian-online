/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Button, Stack, useBreakpointValue
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NilaiPage() {
  const { user } = useAuth();
  const [nilaiList, setNilaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (user?.uid) fetchNilai();
  }, [user]);

  const fetchNilai = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "jawaban"));
    const hasil = [];

    for (const docSnap of snap.docs) {
      const d = docSnap.data();
      if (d.userId !== user.uid || !d.published) continue;

      const soalSnap = await getDocs(collection(db, "soal", d.soalId, "pertanyaan"));
      const kunciMap = {};
      soalSnap.docs.forEach(p => {
        kunciMap[p.id] = p.data().jawabanBenar;
      });

      let benar = 0;
      const soalOrder = d.soalOrder || Object.keys(d.jawaban || {});
      const opsiMap = d.opsiMap || {};

      soalOrder.forEach(id => {
        const pilihan = d.jawaban?.[id];
        const mapping = opsiMap[id];
        const indexAsli = mapping?.[pilihan];
        const kunci = kunciMap[id];
        if (indexAsli != null && indexAsli === kunci) {
          benar++;
        }
      });

      const total = soalOrder.length;
      const nilai = Math.round((benar / total) * 100);
      const soalData = (await getDoc(doc(db, "soal", d.soalId))).data() || {};

      hasil.push({
        ujianId: d.ujianId,
        namaSoal: soalData.nama || "(Ujian)",
        kodeSoal: soalData.kode || "",
        nilai,
        benar,
        total
      });
    }

    setNilaiList(hasil);
    setLoading(false);
  };

  if (loading) return <Spinner m={8} />;

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>Nilai Ujian Saya</Heading>

      {nilaiList.length === 0 ? (
        <Text>Tidak ada data nilai yang tersedia.</Text>
      ) : isMobile ? (
        <Stack spacing={4}>
          {nilaiList.map((n, idx) => (
            <Box key={idx} p={4} shadow="md" borderWidth="1px" borderRadius="md">
              <Text fontWeight="bold" mb={2}>{n.kodeSoal} <br /> {n.namaSoal}</Text>
              <Text>Nilai: <strong>{n.nilai}</strong></Text>
              <Text>Benar: {n.benar}/{n.total}</Text>
              <Button
                size="sm"
                mt={3}
                colorScheme="teal"
                onClick={() => navigate(`/siswa/review/${n.ujianId}`)}
                width="full"
              >
                Lihat Detail
              </Button>
            </Box>
          ))}
        </Stack>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Ujian</Th>
              <Th isNumeric>Nilai</Th>
              <Th isNumeric>Benar</Th>
              <Th>Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {nilaiList.map((n, idx) => (
              <Tr key={idx}>
                <Td>{n.kodeSoal} - {n.namaSoal}</Td>
                <Td isNumeric>{n.nilai}</Td>
                <Td isNumeric>{n.benar}/{n.total}</Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => navigate(`/siswa/review/${n.ujianId}`)}
                  >
                    Detail
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
