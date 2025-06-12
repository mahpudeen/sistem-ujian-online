import {
  Box, Heading, Input, Table, Thead, Tbody, Tr, Th, Td,
  Button, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, useDisclosure, FormControl,
  FormLabel, useToast, Stack, Checkbox, CheckboxGroup
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import {
  collection, getDocs, setDoc, updateDoc, deleteDoc, doc
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, secondaryAuth } from "../../firebase";

export default function ManajemenGuru() {
  const [guruList, setGuruList] = useState([]);
  const [formData, setFormData] = useState({
    nama: "", email: "", mapel: [], subkelas: []
  });  
  const [editId, setEditId] = useState(null);
  const [mapelList, setMapelList] = useState([]);
  const [subkelasList, setSubkelasList] = useState([]);
  const [search, setSearch] = useState("");


  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const guruRef = collection(db, "users");
  const mapelRef = collection(db, "mapel");

  useEffect(() => {
    fetchGuru();
    fetchMapel();
    fetchSubkelas();
  });

  const fetchGuru = async () => {
    const snap = await getDocs(guruRef);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(g => g.role === "guru");
    setGuruList(data);
  };

  const fetchMapel = async () => {
    const snap = await getDocs(mapelRef);
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMapelList(list);
  };

  const fetchSubkelas = async () => {
    const snap = await getDocs(collection(db, "subkelas"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort: 7A, 7B, 8A dst
    list.sort((a, b) => {
      const [numA, letterA] = a.nama.match(/(\d+)([A-Z])/).slice(1);
      const [numB, letterB] = b.nama.match(/(\d+)([A-Z])/).slice(1);
      return numA === numB ? letterA.localeCompare(letterB) : Number(numA) - Number(numB);
    });
  
    setSubkelasList(list);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.email) {
      toast({ title: "Nama & Email wajib diisi", status: "warning" });
      return;
    };

    const emailExists = guruList.some(
      g => g.email === formData.email && g.id !== editId
    );
    
    if (emailExists) {
      toast({
        title: "Email sudah digunakan oleh guru lain.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }    

    try {
      if (editId) {
        await updateDoc(doc(db, "users", editId), formData);
        toast({ title: "Data guru diperbarui", status: "success" });
      } else {
        const result = await createUserWithEmailAndPassword(secondaryAuth, formData.email, "qwerty123");

        await setDoc(doc(db, "users", result.user.uid), {
          ...formData,
          role: "guru"
        });

        toast({
          title: "Guru ditambahkan",
          description: "Password default: qwerty123",
          status: "success"
        });
      }

      resetForm();
      fetchGuru();
    } catch (err) {
      toast({ title: "Terjadi kesalahan", description: err.message, status: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus guru ini?")) return;
    await deleteDoc(doc(db, "users", id));
    toast({ title: "Guru dihapus", status: "info" });
    fetchGuru();
  };

  const handleEdit = (g) => {
    setFormData({
      nama: g.nama,
      email: g.email,
      mapel: g.mapel || []
    });
    setEditId(g.id);
    onOpen();
  };

  const resetForm = () => {
    setFormData({ nama: "", email: "", mapel: [] });
    setEditId(null);
    onClose();
  };

  const filteredGuru = guruList.filter(g =>
    g.nama.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={6}>
      <Heading mb={4}>Manajemen Guru</Heading>

      <Box mb={4} display="flex" gap={3} flexWrap="wrap">
        <Input
          placeholder="Cari nama atau email..."
          maxW="300px"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onOpen}>
          Tambah Guru
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nama</Th>
            <Th>Email</Th>
            <Th>Mapel</Th>
            <Th>Kelas</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredGuru.map((g) => (
            <Tr key={g.id}>
              <Td>{g.nama}</Td>
              <Td>{g.email}</Td>
              <Td>{(g.mapel || []).map(id => mapelList.find(m => m.id === id)?.nama).join(", ")}</Td>
              <Td>
                {(g.subkelas || []).map(id =>
                  subkelasList.find(s => s.id === id)?.nama
                ).join(", ")}
              </Td>
              <Td>
                <IconButton icon={<EditIcon />} size="sm" mr={2} onClick={() => handleEdit(g)} />
                <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => handleDelete(g.id)} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Modal tambah/edit */}
      <Modal isOpen={isOpen} onClose={resetForm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? "Edit Guru" : "Tambah Guru"}</ModalHeader>
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
                <FormLabel>Mapel</FormLabel>
                <CheckboxGroup
                  value={formData.mapel}
                  onChange={(val) => setFormData(f => ({ ...f, mapel: val }))}
                >
                  <Stack direction="row" wrap="wrap">
                    {mapelList.map(m => (
                      <Checkbox key={m.id} value={m.id}>
                        {m.nama}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
              <FormControl>
              <FormLabel>Kelas</FormLabel>
              <CheckboxGroup
                value={formData.subkelas}
                onChange={(val) => setFormData(f => ({ ...f, subkelas: val }))}
              >
                <Stack direction="row" wrap="wrap">
                  {subkelasList.map(sk => (
                    <Checkbox key={sk.id} value={sk.id}>
                      {sk.nama}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
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
