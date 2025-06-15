import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Tag, Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { formatDistanceToNow } from "date-fns";

export default function PantauUjianDetail() {
  const { ujianId } = useParams();
  const [siswaList, setSiswaList] = useState([]);
  const [jumlahSoal, setJumlahSoal] = useState(0);
  const [progresJawaban, setProgresJawaban] = useState({});

  useEffect(() => {
    if (!ujianId) return;

    const run = async () => {
      const ujianSnap = await getDoc(doc(db, "ujianAktif", ujianId));
      const ujian = ujianSnap.data();
      if (!ujian) return;

      const soalSnap = await getDocs(collection(db, "soal", ujian.soalId, "pertanyaan"));
      setJumlahSoal(soalSnap.docs.length);

      const unsub = onSnapshot(
        collection(db, "logUjianAktif", ujianId, "monitoring"),
        async (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSiswaList(data);

          for (const siswa of data) {
            const jawabSnap = await getDoc(doc(db, "jawaban", `${siswa.id}_${ujianId}`));
            if (jawabSnap.exists()) {
              const isi = jawabSnap.data().jawaban || {};
              setProgresJawaban(prev => ({
                ...prev,
                [siswa.id]: Object.keys(isi).length
              }));
            } else {
              setProgresJawaban(prev => ({
                ...prev,
                [siswa.id]: 0
              }));
            }
          }
        }
      );
      return () => unsub();
    };

    run();
  }, [ujianId]);

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading size="lg" mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Monitoring Ujian
      </Heading>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>NIS</Th>
              <Th>Nama</Th>
              <Th>Kelas</Th>
              <Th>Status</Th>
              <Th>Progress</Th>
              <Th>Keluar Page</Th>
              <Th>Aktivitas Terakhir</Th>
              <Th>Warning</Th>
            </Tr>
          </Thead>
          <Tbody>
            {siswaList.map((s) => {
              const bgColor =
                s.tabSwitchCount >= 3
                  ? 'red.400'
                  : !s.sedangUjian
                    ? 'gray.400'
                    : s.tabSwitchCount >= 1
                      ? 'orange.400'
                      : undefined

              return (
                <Tr key={s.id}>
                  <Td bg={bgColor}>{s.nis}</Td>
                  <Td bg={bgColor}>{s.nama}</Td>
                  <Td bg={bgColor}>{s.kelas}</Td>
                  <Td>
                    <Tag colorScheme={s.sedangUjian ? 'green' : 'gray'}>
                      {s.sedangUjian ? 'Aktif' : 'Selesai'}
                    </Tag>
                  </Td>
                  <Td>
                    {progresJawaban[s.id] != null
                      ? `${progresJawaban[s.id]}/${jumlahSoal}`
                      : '-'}
                  </Td>
                  <Td>
                    <Tag
                      colorScheme={
                        s.tabSwitchCount >= 3
                          ? 'red'
                          : s.tabSwitchCount > 0
                            ? 'orange'
                            : 'gray'
                      }
                    >
                      {s.tabSwitchCount || 0}
                    </Tag>
                  </Td>
                  <Td>
                    {s.waktuTerakhirAktif?.seconds
                      ? formatDistanceToNow(
                        new Date(s.waktuTerakhirAktif.seconds * 1000),
                        { addSuffix: true }
                      )
                      : '-'}
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="red.500">
                      {s.warning || '-'}
                    </Text>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
