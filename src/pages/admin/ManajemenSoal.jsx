import {
  Box, Button, Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select, Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BsArchive } from "react-icons/bs";
import { MdLibraryBooks } from "react-icons/md";
import { Link } from "react-router-dom";
import formatTahun from 'utilities/formatTahun';
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import Pagination from 'components/Pagination'
import ConfirmDialog from 'components/ConfirmDialog';
import { logAudit } from 'utilities/logAudit';

export default function ManajemenSoal() {
  const { user } = useAuth();

  const [soalList, setSoalList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [formData, setFormData] = useState({
    nama: "", tahunPelajaran: "", kelas: "", mapel: "", mapelNama: "", type: ""
  });
  const [filter, setFilter] = useState({ tahunPelajaran: "", kelas: "", mapel: "" });
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const itemsPerPage = 10;

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const soalRef = collection(db, "soal");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const soalSnap = await getDocs(soalRef);
    const kelasSnap = await getDocs(collection(db, "kelasUtama"));
    const mapelSnap = await getDocs(collection(db, "mapel"));

    const allSoal = soalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const allMapel = mapelSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let filteredSoal = allSoal.filter(s => !s.arsip);
    let filteredMapel = allMapel;

    if (user.role === "guru") {
      filteredSoal = filteredSoal.filter(s => user.mapel?.includes(s.mapel));
      filteredMapel = allMapel.filter(m => user.mapel?.includes(m.id));
    }

    setSoalList(filteredSoal);
    setKelasList(kelasSnap.docs.map(doc => doc.data().nama));
    setMapelList(filteredMapel);
  };

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateKode = () => {
    const thn = formData.tahunPelajaran;
    const mapel = mapelList.find(m => m.id === formData.mapel)?.kodeMapel || "???";
    const random = Math.floor(Math.random() * 900) + 100;
    return `${mapel}-${formData.kelas}-${thn}-${formData.type}-${random}`;
  };

  const handleSubmit = async () => {
    const selectedMapel = mapelList.find(m => m.id === formData.mapel);
    const kode = generateKode();

    try {
      if (editId) {
        await updateDoc(doc(db, "soal", editId), {
          ...formData,
          mapelNama: selectedMapel?.nama || "",
          kode,
        });
        toast({ title: "Soal diperbarui", status: "success" });

        await logAudit({
          userId: user.uid,
          nama: user.nama,
          role: user.role,
          aksi: "Edit",
          entitas: "List Soal",
          entitasId: editId,
          detail: `Edit soal ${formData.nama}`
        });

      } else {
        const docRef = await addDoc(soalRef, {
          ...formData,
          mapelNama: selectedMapel?.nama || "",
          kode,
          createdAt: Timestamp.now(),
          aktif: true,
        });
        toast({ title: "Soal berhasil ditambahkan", status: "success" });

        await logAudit({
          userId: user.uid,
          nama: user.nama,
          role: user.role,
          aksi: "Tambah",
          entitas: "List Soal",
          entitasId: docRef.id,
          detail: `Tambah soal ${formData.nama}`
        });
      }

      setFormData({ nama: "", tahunPelajaran: "", kelas: "", mapel: "", mapelNama: "", type: "" });
      setEditId(null);
      fetchAll();
      onClose();
    } catch (err) {
      toast({ title: "Gagal simpan", description: err.message, status: "error" });
    }
  };

  const handleArchive = async () => {
    await updateDoc(doc(db, "soal", selectedId), { arsip: true });
    toast({ title: "Soal diarsipkan", status: "info" });

    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Arsip",
      entitas: "List Soal",
      entitasId: selectedId,
      detail: `Arsipkan soal ID ${selectedId}`
    });

    setSelectedId(null);
    setConfirmOpen(false);
    fetchAll();
  };

  const tahunOptions = (() => {
    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    const endYearInclusive = currentYear + 1;
    const result = [];
    for (let i = startYear; i <= endYearInclusive; i++) {
      const start = i;
      const end = i + 1;
      result.push({
        label: `${start}/${end}`,
        value: `${start.toString().slice(2)}${end.toString().slice(2)}`
      });
    }
    return result;
  })();

  const filteredList = soalList.filter(s => {
    return (
      (!filter.tahunPelajaran || s.tahunPelajaran === filter.tahunPelajaran) &&
      (!filter.kelas || s.kelas === filter.kelas) &&
      (!filter.mapel || s.mapel === filter.mapel)
    );
  });

  const pageCount = Math.ceil(filteredList.length / itemsPerPage);
  const currentData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        List Soal
      </Heading>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={4}>
        <Select placeholder="Semua Tahun" onChange={e => setFilter({ ...filter, tahunPelajaran: e.target.value })}>
          {tahunOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
        <Select placeholder="Semua Kelas" onChange={e => setFilter({ ...filter, kelas: e.target.value })}>
          {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
        </Select>
        <Select placeholder="Semua Mapel" onChange={e => setFilter({ ...filter, mapel: e.target.value })}>
          {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
        </Select>
        <Button px={14} colorScheme="teal" onClick={onOpen}>Tambah Soal</Button>
      </Stack>

      <Box overflowX="auto">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Kode</Th>
              <Th>Nama</Th>
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
                  <Stack direction="row" spacing={1}>
                    <Tooltip label="Detail Soal">
                      <IconButton icon={<MdLibraryBooks />} size="sm" colorScheme="blue" as={Link} to={`/${user.role}/soal/${s.id}/detail`} />
                    </Tooltip>
                    <Tooltip label="Edit Soal">
                      <IconButton icon={<AiFillEdit />} size="sm" colorScheme="green" onClick={() => {
                        setFormData({ nama: s.nama, tahunPelajaran: s.tahunPelajaran, kelas: s.kelas, mapel: s.mapel, type: s.type });
                        setEditId(s.id);
                        onOpen();
                      }} />
                    </Tooltip>
                    <Tooltip label="Archive Soal">
                      <IconButton icon={<BsArchive />} size="sm" colorScheme="orange" onClick={() => {
                        setSelectedId(s.id);
                        setConfirmOpen(true);
                      }} />
                    </Tooltip>
                  </Stack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Pagination currentPage={currentPage} pageCount={pageCount} onPageChange={setCurrentPage} data={filteredList} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? "Edit Soal" : "Tambah Soal"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Input placeholder="Nama Soal" name="nama" value={formData.nama} onChange={handleChange} />
              <Select name="tahunPelajaran" placeholder="Pilih Tahun" value={formData.tahunPelajaran} onChange={handleChange}>
                {tahunOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <Select name="kelas" placeholder="Pilih Kelas" value={formData.kelas} onChange={handleChange}>
                {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
              </Select>
              <Select name="mapel" placeholder="Pilih Mapel" value={formData.mapel} onChange={handleChange}>
                {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
              </Select>
              <Select name="type" placeholder="Tipe Soal" value={formData.type} onChange={handleChange}>
                {"ABCDEFGHIJ".split("").map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSubmit}>Simpan</Button>
            <Button onClick={onClose} ml={2}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleArchive}
        title="Arsipkan Soal"
        description="Soal akan dipindahkan ke Bank Soal. Lanjutkan?"
      />
    </Box>
  );
}
