import {
  Box, Heading,
  HStack,
  IconButton,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr
} from "@chakra-ui/react";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiFillDelete, AiOutlineRollback } from "react-icons/ai";
import { MdLibraryBooks } from "react-icons/md";
import { Link } from "react-router-dom";
import formatTahun from "utilities/formatTahun";
import Pagination from '../../components/Pagination';
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import ConfirmDialog from 'components/ConfirmDialog';
import { logAudit } from 'utilities/logAudit';

export default function ManajemenBankSoal() {
  const { user } = useAuth();
  const [soalList, setSoalList] = useState([]);
  const [filter, setFilter] = useState({ kelas: "", mapel: "" });
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const soalSnap = await getDocs(collection(db, "soal"));
    const kelasSnap = await getDocs(collection(db, "kelasUtama"));
    const mapelSnap = await getDocs(collection(db, "mapel"));

    const allMapel = mapelSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allSoal = soalSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(s => s.arsip);

    let filteredMapel = allMapel;
    if (user.role === "guru") {
      filteredMapel = allMapel.filter(m => user.mapel?.includes(m.id));
    }

    setSoalList(allSoal);
    setMapelList(filteredMapel);
    setKelasList(kelasSnap.docs.map(d => d.data().nama));
  };

  const filteredList = soalList.filter(s => {
    return (
      (!filter.kelas || s.kelas === filter.kelas) &&
      (!filter.mapel || s.mapel === filter.mapel)
    );
  });

  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageCount = Math.ceil(filteredList.length / itemsPerPage);

  const handleRestore = async (id) => {
    await updateDoc(doc(db, "soal", id), { arsip: false });
  
    const soal = soalList.find(s => s.id === id);
    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Restore",
      entitas: "Bank Soal (Arsip)",
      entitasId: id,
      detail: `Restore soal ${soal?.nama}`
    });
  
    fetchData();
  };
  
  const handleDelete = async () => {
    if (!selectedId) return;
    await deleteDoc(doc(db, "soal", selectedId));
  
    const soal = soalList.find(s => s.id === selectedId);
    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Hapus Permanen",
      entitas: "Bank Soal (Arsip)",
      entitasId: selectedId,
      detail: `Hapus soal ${soal?.nama} permanen`
    });
  
    setSelectedId(null);
    setConfirmOpen(false);
    fetchData();
  };

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Bank Soal (Arsip)
      </Heading>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        mb={4}
        align={{ base: 'stretch', md: 'center' }}
      >
        <Select
          placeholder="Semua Kelas"
          onChange={(e) => setFilter({ ...filter, kelas: e.target.value })}
          size={{ base: 'sm', md: 'md' }}
        >
          {kelasList.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </Select>

        <Select
          placeholder="Semua Mapel"
          onChange={(e) => setFilter({ ...filter, mapel: e.target.value })}
          size={{ base: 'sm', md: 'md' }}
        >
          {mapelList.map(m => (
            <option key={m.id} value={m.id}>{m.nama}</option>
          ))}
        </Select>
      </Stack>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th whiteSpace="nowrap">Kode</Th>
              <Th>Nama</Th>
              <Th>Kelas</Th>
              <Th>Mapel</Th>
              <Th>Tahun</Th>
              <Th>Type</Th>
              <Th w="10%">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedList.map((s) => (
              <Tr key={s.id}>
                <Td whiteSpace="nowrap">{s.kode}</Td>
                <Td>{s.nama}</Td>
                <Td>{s.kelas}</Td>
                <Td>{s.mapelNama}</Td>
                <Td>{formatTahun(s.tahunPelajaran)}</Td>
                <Td>{s.type}</Td>
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label="Detail Soal">
                      <IconButton
                        icon={<MdLibraryBooks />}
                        size="sm"
                        colorScheme="blue"
                        as={Link}
                        to={`/${user.role}/soal/${s.id}/detail`}
                        aria-label="detail"
                      />
                    </Tooltip>
                    <Tooltip label="Kembalikan Soal">
                      <IconButton
                        icon={<AiOutlineRollback />}
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleRestore(s.id)}
                        aria-label="restore"
                      />
                    </Tooltip>
                    <Tooltip label="Hapus Permanen">
                      <IconButton
                        icon={<AiFillDelete />}
                        size="sm"
                        colorScheme="red"
                        aria-label="delete"
                        onClick={() => {
                          setSelectedId(s.id);
                          setConfirmOpen(true);
                        }}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={setCurrentPage}
        data={filteredList}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Permanen"
        description="Soal akan dihapus secara permanen. Lanjutkan?"
      />
    </Box>
  );
}
