import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  VStack,
  Text
} from '@chakra-ui/react'
import { FiUsers, FiUserCheck, FiFileText, FiClock } from 'react-icons/fi'
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [totalGuru, setTotalGuru] = useState(0);
  const [totalSoal, setTotalSoal] = useState(0);
  const [ujianAktif, setUjianAktif] = useState([]);

  useEffect(() => {
    fetchStatistik();
    fetchUjianTerdekat();
  }, []);

  const fetchStatistik = async () => {
    const userSnap = await getDocs(collection(db, "users"));
    const siswa = userSnap.docs.filter(d => d.data().role === "siswa").length;
    const guru = userSnap.docs.filter(d => d.data().role === "guru").length;
    setTotalSiswa(siswa);
    setTotalGuru(guru);

    const soalSnap = await getDocs(collection(db, "soal"));
    const allSoal = soalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filteredSoal = allSoal.filter(s => !s.arsip);
    setTotalSoal(filteredSoal.length);
  };

  const fetchUjianTerdekat = async () => {
    const snap = await getDocs(collection(db, "ujianAktif"));
    const now = new Date();
    const list = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.aktif && u.selesai.toDate() >= now)
      .sort((a, b) => a.mulai.toDate() - b.mulai.toDate())
      .slice(0, 5);
    setUjianAktif(list);
  };

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={10}>
        <StatBox icon={FiUsers} label="Total Siswa" value={totalSiswa} />
        <StatBox icon={FiUserCheck} label="Total Guru" value={totalGuru} />
        <StatBox icon={FiFileText} label="Total Soal" value={totalSoal} />
        <StatBox icon={FiClock} label="Ujian Aktif" value={ujianAktif.length} />
      </SimpleGrid>

      <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
        <Heading size="md" mb={4}>
          Ujian Terdekat
        </Heading>

        <Table variant="striped" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Kode</Th>
              <Th>Nama Soal</Th>
              <Th>Kelas</Th>
              <Th>Mulai</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ujianAktif.length > 0 ? (
              ujianAktif.map((u) => (
                <Tr key={u.id}>
                  <Td fontWeight="medium">{u.soalKode}</Td>
                  <Td>{u.soalNama}</Td>
                  <Td>{u.kelas.join(', ')}</Td>
                  <Td>{format(u.mulai.toDate(), 'dd/MM/yyyy HH:mm')}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4}>
                  <Text textAlign="center" py={4} color="gray.500">
                    Tidak ada ujian aktif saat ini.
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}

const StatBox = ({ icon, label, value }) => (
  <Box
    bg="white"
    borderRadius="xl"
    p={4}
    boxShadow="sm"
    display="flex"
    alignItems="center"
    gap={3}
  >
    <Box
      bg="teal.100"
      color="teal.700"
      p={2}
      borderRadius="md"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Icon as={icon} boxSize={5} />
    </Box>

    <Stat>
      <StatLabel fontSize="sm" color="gray.600">
        {label}
      </StatLabel>
      <StatNumber fontSize="lg">{value}</StatNumber>
    </Stat>
  </Box>
)
