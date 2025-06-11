import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, useToast,
  IconButton, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, useDisclosure,
  FormControl, FormLabel, Input, Stack, Select
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection, getDocs, doc, updateDoc, deleteDoc, addDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, secondaryAuth } from "../../firebase";

export default function ManajemenSiswa() {
  const [subkelasList, setSubkelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [formData, setFormData] = useState({ nama: "", email: "", kelas: "" });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const siswaRef = collection(db, "users");

  useEffect(() => {
    fetchSiswa();
    fetchSubkelas();
  })

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
  
    // Sort: 7A, 7B, 8A dst
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
    if (!formData.nama || !formData.email || !formData.kelas) return;

    const emailExists = siswaList.some(
      s => s.email === formData.email && s.id !== editId
    );

    if (emailExists) {
      toast({
        title: "Email sudah digunakan.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "users", editId), formData);
        toast({ title: "Data diperbarui", status: "success" });
      } else {
        await createUserWithEmailAndPassword(secondaryAuth, formData.email, "password123");

        await addDoc(siswaRef, {
          ...formData,
          role: "siswa",
        });
        toast({
          title: "Siswa berhasil ditambahkan",
          description: "Password default: password123",
          status: "success",
        });
        
      }
      resetForm();
      fetchSiswa();
    } catch (err) {
      toast({ title: "Terjadi kesalahan", description: err.message, status: "error" });
    }
  };

  const handleEdit = (siswa) => {
    setFormData({
      nama: siswa.nama,
      email: siswa.email,
      kelas: siswa.kelas,
    });
    setEditId(siswa.id);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus siswa ini?")) return;
    await deleteDoc(doc(db, "users", id));
    toast({ title: "Siswa dihapus", status: "info" });
    fetchSiswa();
  };

  const resetForm = () => {
    setFormData({ nama: "", email: "", kelas: "" });
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

  return (
    <Box p={6}>
      <Heading mb={4}>Manajemen Siswa</Heading>

      <Box mb={4} display="flex" gap={3} flexWrap="wrap">
        <Input
          placeholder="Cari nama atau email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          maxW="300px"
        />
        <Select
          maxW="200px"
          value={filterKelas}
          onChange={(e) => handleFilterKelas(e.target.value)}
        >
          <option value="Semua">Semua Kelas</option>
          {subkelasList.map((sub) => (
            <option key={sub.id} value={sub.nama}>{sub.nama}</option>
          ))}
        </Select>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onOpen}>
          Tambah Siswa
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nama</Th>
            <Th>Email</Th>
            <Th>Kelas</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
        {filteredList
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((siswa) => (
            <Tr key={siswa.id}>
              <Td>{siswa.nama}</Td>
              <Td>{siswa.email}</Td>
              <Td>{siswa.kelas}</Td>
              <Td>
                <IconButton icon={<EditIcon />} size="sm" mr={2} onClick={() => handleEdit(siswa)} />
                <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => handleDelete(siswa.id)} />
              </Td>
            </Tr>
        ))}

        </Tbody>
      </Table>
      <Box mt={4} display="flex" justifyContent="center" alignItems="center" gap={2}>
        <Button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Sebelumnya
        </Button>
        <Box>
          Halaman {currentPage} dari {Math.ceil(filteredList.length / itemsPerPage)}
        </Box>
        <Button
          onClick={() =>
            setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredList.length / itemsPerPage)))
          }
          disabled={currentPage === Math.ceil(filteredList.length / itemsPerPage)}
        >
          Selanjutnya
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={resetForm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? "Edit Siswa" : "Tambah Siswa"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Nama</FormLabel>
                <Input name="nama" value={formData.nama} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input name="email" value={formData.email} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Kelas</FormLabel>
                <Select
                  name="kelas"
                  placeholder="Pilih subkelas"
                  value={formData.kelas}
                  onChange={handleChange}
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
    </Box>
  );
}
