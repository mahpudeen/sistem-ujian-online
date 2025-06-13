import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  IconButton, Tag, useToast, Flex, Button
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";
import { AiOutlineEye, AiOutlineDelete, AiOutlineRollback } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RekapNilaiArsip() {
  const { user } = useAuth();
  const [ujianList, setUjianList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const toast = useToast();

  useEffect(() => {
    fetchUjian();
  }, []);

  const fetchUjian = async () => {
    const snap = await getDocs(collection(db, "ujianAktif"));
    let list = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.arsip === true);
    
    if (user.role === "guru") {
      list = list.filter(u => user.mapel_name?.includes(u.mapel));
    }

    const jawabanSnap = await getDocs(collection(db, "jawaban"));
    const countMap = {};
    jawabanSnap.docs.forEach(doc => {
      const data = doc.data();
      if (!countMap[data.ujianId]) countMap[data.ujianId] = 0;
      countMap[data.ujianId]++;
    });

    list = list.map(u => ({ ...u, jumlahSiswa: countMap[u.id] || 0 }));

    setUjianList(list);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus permanen rekap nilai ini?")) return;
    await deleteDoc(doc(db, "ujianAktif", id));
    toast({ title: "Rekap nilai dihapus permanen", status: "info" });
    fetchUjian();
  };

  const handleRestore = async (id) => {
    await updateDoc(doc(db, "ujianAktif", id), { arsip: false });
    toast({ title: "Rekap nilai dipulihkan", status: "success" });
    fetchUjian();
  };

  const pageCount = Math.ceil(ujianList.length / itemsPerPage);
  const currentData = ujianList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Box p={6}>
      <Heading mb={4}>Arsip Rekap Nilai</Heading>

      <Table>
        <Thead>
          <Tr>
            <Th>Kode</Th>
            <Th>Nama Soal</Th>
            <Th>Kelas</Th>
            <Th>Waktu</Th>
            <Th>Status</Th>
            <Th>Jumlah Siswa</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentData.map((u) => (
            <Tr key={u.id}>
              <Td>{u.soalKode}</Td>
              <Td>{u.soalNama}</Td>
              <Td>{u.kelas?.join(", ")}</Td>
              <Td>
                {format(u.mulai.toDate(), "dd/MM/yyyy HH:mm")} - <br />
                {format(u.selesai.toDate(), "dd/MM/yyyy HH:mm")}
              </Td>
              <Td><Tag colorScheme="gray">Arsip</Tag></Td>
              <Td>{u.jumlahSiswa}</Td>
              <Td>
                <IconButton
                  as={Link}
                  to={`/${user.role}/nilai/${u.id}`}
                  icon={<AiOutlineEye />}
                  size="sm"
                  colorScheme="blue"
                  mr={2}
                />
                <IconButton
                  icon={<AiOutlineRollback />}
                  onClick={() => handleRestore(u.id)}
                  size="sm"
                  colorScheme="green"
                  mr={2}
                />
                <IconButton
                  icon={<AiOutlineDelete />}
                  onClick={() => handleDelete(u.id)}
                  size="sm"
                  colorScheme="red"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Flex mt={4} justify="center" align="center" gap={4}>
        <Button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Sebelumnya
        </Button>
        <Box>Halaman {currentPage} dari {pageCount}</Box>
        <Button
          onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
          disabled={currentPage === pageCount}
        >
          Selanjutnya
        </Button>
      </Flex>
    </Box>
  );
}
