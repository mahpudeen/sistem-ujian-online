import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Input,
  FormControl, FormLabel, Stack, Select, useToast, IconButton, Tooltip,
  useDisclosure
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ConfirmDialog from "components/ConfirmDialog";
import { DeleteIcon } from "@chakra-ui/icons";
import { logAudit } from "../../utilities/logAudit";
import { useAuth } from "../../context/AuthContext";

export default function ManajemenKelas() {
  const { user } = useAuth();
  const [kelasUtama, setKelasUtama] = useState([]);
  const [subkelas, setSubkelas] = useState([]);
  const [newKelas, setNewKelas] = useState("");
  const [newSubkelas, setNewSubkelas] = useState({ nama: "", kelasUtamaId: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const kelasRef = collection(db, "kelasUtama");
  const subkelasRef = collection(db, "subkelas");

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    const kelasSnap = await getDocs(kelasRef);
    const subkelasSnap = await getDocs(subkelasRef);
    
    setKelasUtama(kelasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setSubkelas(subkelasSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.nama.localeCompare(b.nama)));
  };

  const tambahKelas = async () => {
    if (!newKelas) return;
    const docRef = await addDoc(kelasRef, { nama: newKelas });
    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Tambah",
      entitas: "Manajemen Kelas",
      entitasId: docRef.id,
      detail: `Tambah kelas utama ${newKelas}`
    });
    toast({ title: "Kelas utama ditambahkan", status: "success" });
    setNewKelas("");
    fetchKelas();
  };

  const tambahSubkelas = async () => {
    if (!newSubkelas.nama || !newSubkelas.kelasUtamaId) return;
    const docRef = await addDoc(subkelasRef, newSubkelas);
    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Tambah",
      entitas: "Manajemen Kelas",
      entitasId: docRef.id,
      detail: `Tambah subkelas ${newSubkelas.nama}`
    });
    toast({ title: "Subkelas ditambahkan", status: "success" });
    setNewSubkelas({ nama: "", kelasUtamaId: "" });
    fetchKelas();
  };

  const handleDelete = async () => {
    if (selectedType === "kelas") {
      await deleteDoc(doc(db, "kelasUtama", selectedId));
      await logAudit({
        userId: user.uid,
        nama: user.nama,
        role: user.role,
        aksi: "Hapus",
        entitas: "Manajemen Kelas",
        entitasId: selectedId,
        detail: `Hapus kelas utama`
      });
    } else {
      await deleteDoc(doc(db, "subkelas", selectedId));
      await logAudit({
        userId: user.uid,
        nama: user.nama,
        role: user.role,
        aksi: "Hapus",
        entitas: "Manajemen Kelas",
        entitasId: selectedId,
        detail: `Hapus subkelas`
      });
    }
    fetchKelas();
    onClose();
    setSelectedId(null);
    setSelectedType(null);
  };

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4}>Manajemen Kelas</Heading>
      <Box display="flex" gap={10} flexWrap="wrap">
        <Box flex={1}>
          <Heading size="md" mb={2}>Kelas Utama</Heading>
          <Stack direction="row" mb={4}>
            <Input placeholder="Nama kelas (contoh: 7)" value={newKelas} onChange={(e) => setNewKelas(e.target.value)} />
            <Button onClick={tambahKelas} colorScheme="teal">Tambah</Button>
          </Stack>
          <Table>
            <Thead><Tr><Th>Nama</Th><Th w="10%">Aksi</Th></Tr></Thead>
            <Tbody>
              {kelasUtama.map(k => (
                <Tr key={k.id}>
                  <Td>{k.nama}</Td>
                  <Td>
                    <Tooltip label="Hapus Kelas">
                      <IconButton
                        icon={<DeleteIcon />} size="sm" colorScheme="red"
                        onClick={() => {
                          setSelectedId(k.id); setSelectedType("kelas"); onOpen();
                        }}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box flex={1}>
          <Heading size="md" mb={2}>Subkelas</Heading>
          <Stack mb={4}>
            <FormControl>
              <FormLabel>Nama Subkelas</FormLabel>
              <Input value={newSubkelas.nama} onChange={(e) => setNewSubkelas({ ...newSubkelas, nama: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Kelas Utama</FormLabel>
              <Select placeholder="Pilih kelas utama" value={newSubkelas.kelasUtamaId} onChange={(e) => setNewSubkelas({ ...newSubkelas, kelasUtamaId: e.target.value })}>
                {kelasUtama.map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </Select>
            </FormControl>
            <Button onClick={tambahSubkelas} colorScheme="teal">Tambah</Button>
          </Stack>
          <Table>
            <Thead><Tr><Th>Kelas Utama</Th><Th>Subkelas</Th><Th w="10%">Aksi</Th></Tr></Thead>
            <Tbody>
              {subkelas.map(s => (
                <Tr key={s.id}>
                  <Td>{kelasUtama.find(k => k.id === s.kelasUtamaId)?.nama}</Td>
                  <Td>{s.nama}</Td>
                  <Td>
                    <Tooltip label="Hapus Subkelas">
                      <IconButton
                        icon={<DeleteIcon />} size="sm" colorScheme="red"
                        onClick={() => {
                          setSelectedId(s.id); setSelectedType("subkelas"); onOpen();
                        }}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        description="Data akan dihapus secara permanen. Lanjutkan?"
      />
    </Box>
  );
}
