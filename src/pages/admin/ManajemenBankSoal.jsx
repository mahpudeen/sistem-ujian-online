import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton, Tooltip, Button,
  Stack, Select, Flex
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AiFillDelete, AiOutlineRollback } from "react-icons/ai";
import { MdLibraryBooks } from "react-icons/md";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import formatTahun from "utilities/formatTahun";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function ManajemenBankSoal() {
  const { user } = useAuth();
  const [soalList, setSoalList] = useState([]);
  const [filter, setFilter] = useState({ kelas: "", mapel: "" });
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus soal ini permanen?")) return;
    await deleteDoc(doc(db, "soal", id));
    fetchData();
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Bank Soal (Arsip)</Heading>
      <Stack direction="row" mb={4}>
        <Select placeholder="Semua Kelas" onChange={(e) => setFilter({ ...filter, kelas: e.target.value })}>
          {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
        </Select>
        <Select placeholder="Semua Mapel" onChange={(e) => setFilter({ ...filter, mapel: e.target.value })}>
          {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
        </Select>
      </Stack>

      <Table>
        <Thead>
          <Tr>
            <Th>Kode</Th>
            <Th>Nama</Th>
            <Th>Kelas</Th>
            <Th>Mapel</Th>
            <Th>Tahun</Th>
            <Th>Type</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedList.map((s) => (
            <Tr key={s.id}>
              <Td>{s.kode}</Td>
              <Td>{s.nama}</Td>
              <Td>{s.kelas}</Td>
              <Td>{s.mapelNama}</Td>
              <Td>{formatTahun(s.tahunPelajaran)}</Td>
              <Td>{s.type}</Td>
              <Td>
                <Tooltip label="Detail Soal">
                  <IconButton
                    icon={<MdLibraryBooks />}
                    size="sm"
                    mr={2}
                    colorScheme="blue"
                    as={Link}
                    to={`/${user.role}/soal/${s.id}/detail`}
                  />
                </Tooltip>
                <Tooltip label="Kembalikan Soal">
                  <IconButton
                    icon={<AiOutlineRollback />}
                    size="sm"
                    mr={2}
                    colorScheme="green"
                    onClick={() => handleRestore(s.id)}
                  />
                </Tooltip>
                <Tooltip label="Hapus Permanen">
                  <IconButton
                    icon={<AiFillDelete />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(s.id)}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Flex mt={4} justify="center" align="center" gap={4}>
        <Button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          isDisabled={currentPage === 1}
        >
          Sebelumnya
        </Button>
        <Box>Halaman {currentPage} dari {pageCount}</Box>
        <Button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
          isDisabled={currentPage === pageCount}
        >
          Selanjutnya
        </Button>
      </Flex>
    </Box>
  );
}
