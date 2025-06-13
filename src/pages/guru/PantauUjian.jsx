import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  Tag, Button
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
    <Box p={6}>
      <Heading size="lg" mb={4}>Pantau Ujian Aktif</Heading>

      <Table>
        <Thead>
          <Tr>
            <Th>Kode</Th>
            <Th>Nama Soal</Th>
            <Th>Kelas</Th>
            <Th>Siswa Sedang Ujian</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ujianList.map((ujian) => (
            <Tr key={ujian.id}>
              <Td>{ujian.soalKode}</Td>
              <Td>{ujian.soalNama}</Td>
              <Td>{ujian.kelas.join(", ")}</Td>
              <Td>{jumlahSiswaAktif[ujian.id] || 0}</Td>
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
  );
}
