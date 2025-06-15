import {
  Box, Button, Heading, IconButton, Input, Stack, Table, Tbody,
  Td, Th, Thead, Tooltip, Tr, useDisclosure, useToast, FormControl,
  FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton
} from "@chakra-ui/react";
import ConfirmDialog from 'components/ConfirmDialog';
import {
  addDoc, collection, deleteDoc, doc, getDocs, updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { logAudit } from "utilities/logAudit";

export default function ManajemenMapel() {
  const { user } = useAuth();
  const [mapelList, setMapelList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ kodeMapel: "", nama: "" });
  const [editId, setEditId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const confirm = useDisclosure();
  const toast = useToast();

  const mapelRef = collection(db, "mapel");

  useEffect(() => {
    fetchMapel();
  }, []);

  const fetchMapel = async () => {
    const snapshot = await getDocs(mapelRef);
    const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setMapelList(all);
    setFiltered(all);
  };

  const handleSearch = (value) => {
    setSearch(value);
    const lower = value.toLowerCase();
    setFiltered(mapelList.filter(m =>
      m.nama.toLowerCase().includes(lower) ||
      m.kodeMapel.toLowerCase().includes(lower)
    ));
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.kodeMapel) {
      toast({ title: "Nama & Kode wajib diisi", status: "warning" });
      return;
    }

    if (editId) {
      await updateDoc(doc(db, "mapel", editId), formData);
      toast({ title: "Mapel diperbarui", status: "success" });

      await logAudit({
        userId: user.uid,
        nama: user.nama,
        aksi: "Edit",
        entitas: "mapel",
        entitasId: editId,
        detail: `Edit mapel ${formData.nama} (${formData.kodeMapel})`
      });
    } else {
      const docRef = await addDoc(mapelRef, formData);
      toast({ title: "Mapel ditambahkan", status: "success" });

      await logAudit({
        userId: user.uid,
        nama: user.nama,
        aksi: "Tambah",
        entitas: "mapel",
        entitasId: docRef.id,
        detail: `Tambah mapel ${formData.nama} (${formData.kodeMapel})`
      });
    }

    fetchMapel();
    resetForm();
  };

  const resetForm = () => {
    setFormData({ kodeMapel: "", nama: "" });
    setEditId(null);
    onClose();
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "mapel", selectedId));
    toast({ title: "Mapel berhasil dihapus", status: "info" });

    await logAudit({
      userId: user.uid,
      nama: user.nama,
      aksi: "Hapus",
      entitas: "mapel",
      entitasId: selectedId,
      detail: `Hapus mapel ID ${selectedId}`
    });

    fetchMapel();
    confirm.onClose();
    setSelectedId(null);
  };

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Manajemen Mapel
      </Heading>

      <Stack direction={{ base: "column", md: "row" }} mb={4}>
        <Input
          placeholder="Cari mapel..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          maxW="300px"
        />
        <Button colorScheme="teal" onClick={onOpen} px={6}>
          Tambah Mapel
        </Button>
      </Stack>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Kode</Th>
              <Th>Nama</Th>
              <Th w="10%">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((mapel) => (
              <Tr key={mapel.id}>
                <Td>{mapel.kodeMapel}</Td>
                <Td>{mapel.nama}</Td>
                <Td>
                  <Tooltip label="Edit Mapel">
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="yellow"
                      mr={2}
                      onClick={() => {
                        setFormData({ kodeMapel: mapel.kodeMapel, nama: mapel.nama });
                        setEditId(mapel.id);
                        onOpen();
                      }}
                    />
                  </Tooltip>
                  <Tooltip label="Hapus Mapel">
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => {
                        setSelectedId(mapel.id);
                        confirm.onOpen();
                      }}
                    />
                  </Tooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isOpen} onClose={resetForm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? "Edit Mapel" : "Tambah Mapel"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Kode Mapel</FormLabel>
                <Input
                  name="kodeMapel"
                  value={formData.kodeMapel}
                  onChange={(e) =>
                    setFormData({ ...formData, kodeMapel: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nama Mapel</FormLabel>
                <Input
                  name="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSubmit}>
              Simpan
            </Button>
            <Button onClick={resetForm} ml={3}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog Konfirmasi */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.onClose}
        onConfirm={handleDelete}
        title="Hapus Mapel"
        description="Mapel akan dihapus secara permanen. Lanjutkan?"
      />
    </Box>
  );
}
