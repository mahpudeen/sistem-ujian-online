import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, useToast,
  IconButton, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, useDisclosure,
  FormControl, FormLabel, Input, Stack, Select
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection, getDocs, doc, updateDoc, deleteDoc, setDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, secondaryAuth } from "../../firebase";
import ConfirmDialog from "components/ConfirmDialog";
import Pagination from "components/Pagination";
import { logAudit } from "utilities/logAudit";
import { useAuth } from "../../context/AuthContext";

export default function ManajemenSiswa() {
  const { user } = useAuth();
  const [subkelasList, setSubkelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [formData, setFormData] = useState({ nama: "", email: "", kelas: "", nis: "" });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedId, setSelectedId] = useState(null);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const confirmDialog = useDisclosure();

  const siswaRef = collection(db, "users");

  useEffect(() => {
    fetchSiswa();
    fetchSubkelas();
  }, []);

  const fetchSiswa = async () => {
    const snapshot = await getDocs(siswaRef);
    const data = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.role === "siswa");

    setSiswaList(data);
    setFilteredList(data);
  };

  const fetchSubkelas = async () => {
    const snapshot = await getDocs(collection(db, "subkelas"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    data.sort((a, b) => {
      const [numA, letterA] = a.nama.match(/(\d+)([A-Z])/).slice(1);
      const [numB, letterB] = b.nama.match(/(\d+)([A-Z])/).slice(1);
      return numA === numB ? letterA.localeCompare(letterB) : Number(numA) - Number(numB);
    });

    setSubkelasList(data);
  };

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.nama || !formData.email || !formData.kelas || !formData.nis) {
      toast({ title: "Semua field wajib diisi", status: "warning" });
      return;
    }

    const nisExists = siswaList.some(
      s => s.nis === formData.nis && s.id !== editId
    );

    if (nisExists) {
      toast({ title: "NIS sudah digunakan.", status: "warning" });
      return;
    }

    const emailExists = siswaList.some(
      s => s.email === formData.email && s.id !== editId
    );

    if (emailExists) {
      toast({ title: "Email sudah digunakan.", status: "warning" });
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "users", editId), formData);
        await logAudit({
          userId: user.uid,
          nama: user.nama,
          role: user.role,
          aksi: "Edit",
          entitas: "Manajemen Siswa",
          entitasId: editId,
          detail: `Edit siswa ${formData.nama}`
        });
        toast({ title: "Data diperbarui", status: "success" });
      } else {
        const result = await createUserWithEmailAndPassword(secondaryAuth, formData.email, "password123");
        await setDoc(doc(db, "users", result.user.uid), {
          ...formData,
          role: "siswa"
        });
        await logAudit({
          userId: user.uid,
          nama: user.nama,
          role: user.role,
          aksi: "Tambah",
          entitas: "Manajemen Siswa",
          entitasId: result.user.uid,
          detail: `Tambah siswa ${formData.nama}`
        });
        toast({ title: "Siswa berhasil ditambahkan", description: "Password default: password123", status: "success" });
      }
      resetForm();
      fetchSiswa();
    } catch (err) {
      toast({ title: "Terjadi kesalahan", description: err.message, status: "error" });
    }
  };

  const handleEdit = (siswa) => {
    setFormData({ nama: siswa.nama, email: siswa.email, kelas: siswa.kelas, nis: siswa.nis || "" });
    setEditId(siswa.id);
    onOpen();
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "users", selectedId));
    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Hapus",
      entitas: "Manajemen Siswa",
      entitasId: selectedId,
      detail: `Hapus siswa`
    });
    toast({ title: "Siswa dihapus", status: "info" });
    fetchSiswa();
    confirmDialog.onClose();
  };

  const resetForm = () => {
    setFormData({ nama: "", email: "", kelas: "", nis: "" });
    setEditId(null);
    onClose();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterList(query, filterKelas);
    setCurrentPage(1);
  };

  const handleFilterKelas = (kelas) => {
    setFilterKelas(kelas);
    filterList(searchQuery, kelas);
    setCurrentPage(1);
  };

  const filterList = (search, kelas) => {
    const filtered = siswaList.filter(siswa => {
      const matchSearch =
        siswa.nama.toLowerCase().includes(search.toLowerCase()) ||
        siswa.email.toLowerCase().includes(search.toLowerCase());
      const matchKelas = kelas === "Semua" || siswa.kelas === kelas;
      return matchSearch && matchKelas;
    });
    setFilteredList(filtered);
  };

  const pageCount = Math.ceil(filteredList.length / itemsPerPage);
  const currentData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Manajemen Siswa
      </Heading>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={3}
        mb={4}
        align={{ base: 'stretch', md: 'center' }}
      >
        <Input
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          maxW={{ base: '100%', md: '300px' }}
          size="sm"
        />
        <Select
          maxW={{ base: '100%', md: '200px' }}
          value={filterKelas}
          onChange={(e) => handleFilterKelas(e.target.value)}
          size="sm"
        >
          <option value="Semua">Semua Kelas</option>
          {subkelasList.map((sub) => (
            <option key={sub.id} value={sub.nama}>{sub.nama}</option>
          ))}
        </Select>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={onOpen}
          w={{ base: 'full', md: 'auto' }}
        >
          Tambah Siswa
        </Button>
      </Stack>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>NIS</Th>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Kelas</Th>
              <Th w="10%">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((siswa) => (
              <Tr key={siswa.id}>
                <Td>{siswa.nis}</Td>
                <Td>{siswa.nama}</Td>
                <Td>{siswa.email}</Td>
                <Td>{siswa.kelas}</Td>
                <Td>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      aria-label="Edit"
                      onClick={() => handleEdit(siswa)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      aria-label="Delete"
                      onClick={() => {
                        setSelectedId(siswa.id)
                        confirmDialog.onOpen()
                      }}
                    />
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
          data={filteredList}
        />
      </Box>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isOpen} onClose={resetForm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? "Edit Siswa" : "Tambah Siswa"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Nama</FormLabel>
                <Input name="nama" value={formData.nama} onChange={handleChange} size="sm" />
              </FormControl>
              <FormControl>
                <FormLabel>NIS</FormLabel>
                <Input name="nis" value={formData.nis} onChange={handleChange} size="sm" />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input name="email" value={formData.email} onChange={handleChange} size="sm" />
              </FormControl>
              <FormControl>
                <FormLabel>Kelas</FormLabel>
                <Select
                  name="kelas"
                  placeholder="Pilih subkelas"
                  value={formData.kelas}
                  onChange={handleChange}
                  size="sm"
                >
                  {subkelasList.map(sub => (
                    <option key={sub.id} value={sub.nama}>{sub.nama}</option>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
              Simpan
            </Button>
            <Button onClick={resetForm}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.onClose}
        onConfirm={handleDelete}
        title="Hapus Siswa"
        description="Siswa akan dihapus secara permanen. Lanjutkan?"
      />
    </Box>

  );
}
