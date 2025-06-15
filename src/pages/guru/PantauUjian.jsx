import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";

export default function PantauUjian() {
  const { user } = useAuth();

  const [ujianList, setUjianList] = useState([]);
  const [jumlahSiswaAktif, setJumlahSiswaAktif] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUjianAktif();
  }, []);

  const fetchUjianAktif = async () => {
    const snap = await getDocs(collection(db, "ujianAktif"));
    const now = new Date();

    let aktifList = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.aktif && now <= u.selesai.toDate() && !u.arsip);

    if (user.role === "guru") {
      aktifList = aktifList.filter(u => user.mapel_name?.includes(u.mapel));
    }

    setUjianList(aktifList);

    aktifList.forEach(ujian => {
      const unsub = onSnapshot(
        collection(db, "logUjianAktif", ujian.id, "monitoring"),
        (snapshot) => {
          const aktifSiswa = snapshot.docs.filter(d => d.data().sedangUjian).length;
          setJumlahSiswaAktif(prev => ({ ...prev, [ujian.id]: aktifSiswa }));
        }
      );
    });
  };

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading size="lg" mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Pantau Ujian Aktif
      </Heading>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Kode</Th>
              <Th>Nama Soal</Th>
              <Th>Kelas</Th>
              <Th whiteSpace="nowrap">Siswa Sedang Ujian</Th>
              <Th>Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ujianList.map((ujian) => (
              <Tr key={ujian.id}>
                <Td>{ujian.soalKode}</Td>
                <Td>{ujian.soalNama}</Td>
                <Td>{ujian.kelas.join(', ')}</Td>
                <Td whiteSpace="nowrap">
                  {jumlahSiswaAktif[ujian.id] || 0}
                </Td>
                <Td>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    as={Link}
                    to={`${ujian.id}`}
                  >
                    Lihat Monitoring
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>

  );
}
