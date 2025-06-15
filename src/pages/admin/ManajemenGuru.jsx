import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem
} from "@chakra-ui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, secondaryAuth } from "../../firebase";

export default function ManajemenGuru() {
  const [guruList, setGuruList] = useState([]);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    mapel: [],
    mapel_name: [],
    subkelas: [],
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
    const data = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((g) => g.role === "guru");
    setGuruList(data);
  };

  const fetchMapel = async () => {
    const snap = await getDocs(mapelRef);
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMapelList(list);
  };

  const fetchSubkelas = async () => {
    const snap = await getDocs(collection(db, "subkelas"));
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort: 7A, 7B, 8A dst
    list.sort((a, b) => {
      const [numA, letterA] = a.nama.match(/(\d+)([A-Z])/).slice(1);
      const [numB, letterB] = b.nama.match(/(\d+)([A-Z])/).slice(1);
      return numA === numB
        ? letterA.localeCompare(letterB)
        : Number(numA) - Number(numB);
    });

    setSubkelasList(list);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.email) {
      toast({ title: "Nama & Email wajib diisi", status: "warning" });
      return;
    }

    const emailExists = guruList.some(
      (g) => g.email === formData.email && g.id !== editId
    );

    if (emailExists) {
      toast({
        title: "Email sudah digunakan oleh guru lain.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "users", editId), formData);
        toast({ title: "Data guru diperbarui", status: "success" });
      } else {
        const result = await createUserWithEmailAndPassword(
          secondaryAuth,
          formData.email,
          "qwerty123"
        );

        await setDoc(doc(db, "users", result.user.uid), {
          ...formData,
          role: "guru",
        });

        toast({
          title: "Guru ditambahkan",
          description: "Password default: qwerty123",
          status: "success",
        });
      }

      resetForm();
      fetchGuru();
    } catch (err) {
      toast({
        title: "Terjadi kesalahan",
        description: err.message,
        status: "error",
      });
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
      mapel: g.mapel || [],
      subkelas: g.subkelas || [],
    });
    setEditId(g.id);
    onOpen();
  };

  const resetForm = () => {
    setFormData({ nama: "", email: "", mapel: [] });
    setEditId(null);
    onClose();
  };

  const filteredGuru = guruList.filter(
    (g) =>
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Manajemen Guru
      </Heading>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={3}
        mb={4}
        align={{ base: 'stretch', md: 'center' }}
      >
        <Input
          placeholder="Cari nama atau email..."
          value={search}
          maxW={{ base: '100%', md: '300px' }}
          onChange={(e) => setSearch(e.target.value)}
          size={{ base: 'sm', md: 'md' }}
        />
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={onOpen}
          w={{ base: 'full', md: 'auto' }}
        >
          Tambah Guru
        </Button>
      </Stack>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm" variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Mapel</Th>
              <Th>Kelas</Th>
              <Th w="10%">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredGuru.map((g) => (
              <Tr key={g.id}>
                <Td>{g.nama}</Td>
                <Td>{g.email}</Td>
                <Td>
                  {(g.mapel || [])
                    .map((id) => mapelList.find((m) => m.id === id)?.nama)
                    .join(', ')}
                </Td>
                <Td>{g.subkelas_name.join(', ')}</Td>
                <Td>
                  <Stack direction="row" spacing={2}>
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => handleEdit(g)}
                      aria-label="Edit"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(g.id)}
                      aria-label="Delete"
                    />
                  </Stack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={resetForm} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? 'Edit Guru' : 'Tambah Guru'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Nama</FormLabel>
                <Input
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Mapel</FormLabel>
                <CheckboxGroup
                  value={formData.mapel}
                  onChange={(val) => {
                    const selected = mapelList
                      .filter((m) => val.includes(m.id))
                      .map((m) => m.nama)
                    setFormData((f) => ({
                      ...f,
                      mapel: val,
                      mapel_name: selected
                    }))
                  }}
                >
                  <Wrap>
                    {mapelList.map((m) => (
                      <WrapItem key={m.id}>
                        <Checkbox value={m.id}>{m.nama}</Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Kelas</FormLabel>
                <CheckboxGroup
                  value={formData.subkelas}
                  onChange={(val) => {
                    const selected = subkelasList
                      .filter((s) => val.includes(s.id))
                      .map((s) => s.nama)
                    setFormData((f) => ({
                      ...f,
                      subkelas: val,
                      subkelas_name: selected
                    }))
                  }}
                >
                  <Wrap>
                    {subkelasList.map((sk) => (
                      <WrapItem key={sk.id}>
                        <Checkbox value={sk.id}>{sk.nama}</Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={2} onClick={handleSubmit}>
              Simpan
            </Button>
            <Button onClick={resetForm}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>

  );
}
