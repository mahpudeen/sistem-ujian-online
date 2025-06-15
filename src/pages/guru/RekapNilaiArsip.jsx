import {
  Box, Heading,
  IconButton,
  Stack,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import ConfirmDialog from "components/ConfirmDialog";
import Pagination from "components/Pagination";
import { format } from "date-fns";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEye, AiOutlineRollback } from "react-icons/ai";
import { Link } from "react-router-dom";
import { logAudit } from "utilities/logAudit";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";

export default function RekapNilaiArsip() {
  const { user } = useAuth();
  const [ujianList, setUjianList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmMode, setConfirmMode] = useState(""); // 'delete' atau 'restore'
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const confirmDelete = async () => {
    await deleteDoc(doc(db, "ujianAktif", selectedId));
    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Hapus Permanen",
      entitas: "Arsip Rekap Nilai",
      entitasId: selectedId,
      detail: `Menghapus permanen rekap nilai ${selectedId}`
    });
    toast({ title: "Rekap nilai dihapus permanen", status: "info" });
    fetchUjian();
    onClose();
  };

  const confirmRestore = async () => {
    await updateDoc(doc(db, "ujianAktif", selectedId), { arsip: false });
    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Pulihkan",
      entitas: "Arsip Rekap Nilai",
      entitasId: selectedId,
      detail: `Memulihkan rekap nilai ${selectedId}`
    });
    toast({ title: "Rekap nilai dipulihkan", status: "success" });
    fetchUjian();
    onClose();
  };


  const pageCount = Math.ceil(ujianList.length / itemsPerPage);
  const currentData = ujianList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Arsip Rekap Nilai
      </Heading>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Kode</Th>
              <Th>Nama Soal</Th>
              <Th>Kelas</Th>
              <Th>Waktu</Th>
              <Th>Status</Th>
              <Th>Jumlah Siswa</Th>
              <Th w="10%">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((u) => (
              <Tr key={u.id}>
                <Td>{u.soalKode}</Td>
                <Td>{u.soalNama}</Td>
                <Td>{u.kelas?.join(', ')}</Td>
                <Td whiteSpace="nowrap">
                  {format(u.mulai.toDate(), 'dd/MM/yyyy HH:mm')} -<br />
                  {format(u.selesai.toDate(), 'dd/MM/yyyy HH:mm')}
                </Td>
                <Td>
                  <Tag colorScheme="gray">Arsip</Tag>
                </Td>
                <Td>{u.jumlahSiswa}</Td>
                <Td>
                  <Stack direction="row" spacing={1}>
                    <Tooltip label="Lihat Rekap Nilai">
                      <IconButton
                        as={Link}
                        to={`/${user.role}/nilai/${u.id}`}
                        icon={<AiOutlineEye />}
                        size="sm"
                        colorScheme="blue"
                        aria-label="Lihat Rekap"
                      />
                    </Tooltip>
                    <Tooltip label="Pulihkan Rekap">
                      <IconButton
                        icon={<AiOutlineRollback />}
                        onClick={() => {
                          setSelectedId(u.id)
                          setConfirmMode('restore')
                          onOpen()
                        }}
                        size="sm"
                        colorScheme="green"
                        aria-label="Pulihkan"
                      />
                    </Tooltip>
                    <Tooltip label="Hapus Permanen">
                      <IconButton
                        icon={<AiOutlineDelete />}
                        onClick={() => {
                          setSelectedId(u.id)
                          setConfirmMode('delete')
                          onOpen()
                        }}
                        size="sm"
                        colorScheme="red"
                        aria-label="Hapus"
                      />
                    </Tooltip>
                  </Stack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box>
        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={setCurrentPage}
          data={ujianList}
        />
      </Box>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmMode === 'delete' ? confirmDelete : confirmRestore}
        title={confirmMode === 'delete' ? 'Hapus Permanen' : 'Pulihkan Rekap'}
        description={
          confirmMode === 'delete'
            ? 'Rekap nilai akan dihapus permanen. Lanjutkan?'
            : 'Rekap nilai akan dipulihkan. Lanjutkan?'
        }
      />
    </Box>

  );
}
