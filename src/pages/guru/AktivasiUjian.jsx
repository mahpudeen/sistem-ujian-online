import {
  Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  ModalFooter, Stack, Select, Checkbox, CheckboxGroup, Text, Input, useToast,
  IconButton, Tooltip, HStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import formatTahun from 'utilities/formatTahun';
import { useAuth } from "../../context/AuthContext";
import Pagination from "components/Pagination";
import { BsRocketTakeoff } from "react-icons/bs";
import { logAudit } from "utilities/logAudit";
import { FaRegCalendarPlus } from "react-icons/fa"

export default function AktivasiUjian() {
  const { user } = useAuth();
  const [soalList, setSoalList] = useState([]);
  const [subkelasList, setSubkelasList] = useState([]);
  const [selectedSoal, setSelectedSoal] = useState(null);
  const [kelasTerpilih, setKelasTerpilih] = useState([]);
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const soalSnap = await getDocs(collection(db, "soal"));
    const subkelasSnap = await getDocs(collection(db, "subkelas"));

    let allSoal = soalSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    allSoal = allSoal.filter(s => !s.arsip);
    if (user.role === "guru") {
      allSoal = allSoal.filter(s => user.mapel?.includes(s.mapel));
    }
    setSoalList(allSoal);

    let allSubkelas = subkelasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (user.role === "guru") {
      allSubkelas = allSubkelas.filter(s => user.subkelas?.includes(s.id));
    }
    const sortedSubkelas = allSubkelas.sort((a, b) => a.nama.localeCompare(b.nama));
    setSubkelasList(sortedSubkelas);
  };

  const handleAktivasi = async () => {
    if (!selectedSoal || !mulai || !selesai || kelasTerpilih.length === 0) {
      toast({ title: "Lengkapi semua field", status: "warning" });
      return;
    }

    const mulaiTS = Timestamp.fromDate(new Date(mulai));
    const selesaiTS = Timestamp.fromDate(new Date(selesai));
    const durasi = (new Date(selesai) - new Date(mulai)) / 60000;

    const docRef = await addDoc(collection(db, "ujianAktif"), {
      soalId: selectedSoal.id,
      soalKode: selectedSoal.kode,
      soalNama: selectedSoal.nama,
      mapel: selectedSoal.mapelNama,
      kelas: kelasTerpilih,
      mulai: mulaiTS,
      selesai: selesaiTS,
      durasiMenit: durasi,
      aktif: true,
      createdBy: user.uid
    });

    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Aktivasi",
      entitas: "Aktivasi Ujian",
      entitasId: docRef.id,
      detail: `Aktivasi ujian soal ${selectedSoal.nama}`
    });

    toast({ title: "Ujian berhasil diaktifkan", status: "success" });
    setSelectedSoal(null);
    setKelasTerpilih([]);
    setMulai("");
    setSelesai("");
    onClose();
  };

  const pageCount = Math.ceil(soalList.length / itemsPerPage);
  const currentData = soalList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4}>Jadwalkan Ujian</Heading>

      <Table size="sm">
        <Thead bg="gray.50">
          <Tr>
            <Th>Kode</Th>
            <Th>Nama Soal</Th>
            <Th>Kelas</Th>
            <Th>Mapel</Th>
            <Th>Tahun</Th>
            <Th>Type</Th>
            <Th w="10%">Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentData.map((s) => (
            <Tr key={s.id}>
              <Td>{s.kode}</Td>
              <Td>{s.nama}</Td>
              <Td>{s.kelas}</Td>
              <Td>{s.mapelNama}</Td>
              <Td>{formatTahun(s.tahunPelajaran)}</Td>
              <Td>{s.type}</Td>
              <Td>
                <Tooltip label="Jadwalkan Ujian">
                  <IconButton
                    icon={<FaRegCalendarPlus />}
                    size="sm"
                    colorScheme="teal"
                    onClick={() => {
                      setSelectedSoal(s);
                      onOpen();
                    }}
                    aria-label="aktifkan"
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={setCurrentPage}
        data={soalList}
      />

      {/* Modal Aktivasi */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aktivasi Ujian</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSoal && (
              <Box mb={4}>
                <Text><strong>{selectedSoal.nama}</strong></Text>
                <Text fontSize="sm" color="gray.500">{selectedSoal.kode}</Text>
              </Box>
            )}
            <Stack spacing={4}>
              <CheckboxGroup value={kelasTerpilih} onChange={setKelasTerpilih}>
                <Box>
                  <Text fontWeight="bold" mb={1}>Pilih Kelas:</Text>
                  <Stack direction="row" wrap="wrap">
                    {subkelasList.map((k) => (
                      <Checkbox key={k.nama} value={k.nama}>{k.nama}</Checkbox>
                    ))}
                  </Stack>
                </Box>
              </CheckboxGroup>

              <Box>
                <Text fontWeight="bold">Tanggal & Jam Mulai</Text>
                <Input
                  type="datetime-local"
                  value={mulai}
                  onChange={(e) => setMulai(e.target.value)}
                />
              </Box>

              <Box>
                <Text fontWeight="bold">Tanggal & Jam Selesai</Text>
                <Input
                  type="datetime-local"
                  value={selesai}
                  onChange={(e) => setSelesai(e.target.value)}
                />
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleAktivasi}>Simpan</Button>
            <Button onClick={onClose} ml={3}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
