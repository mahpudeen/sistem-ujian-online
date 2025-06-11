import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Input,
  FormControl, FormLabel, Stack, Select, useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function ManajemenKelas() {
  const [kelasUtama, setKelasUtama] = useState([]);
  const [subkelas, setSubkelas] = useState([]);
  const [newKelas, setNewKelas] = useState("");
  const [newSubkelas, setNewSubkelas] = useState({ nama: "", kelasUtamaId: "" });

  const toast = useToast();

  const kelasRef = collection(db, "kelasUtama");
  const subkelasRef = collection(db, "subkelas");

  useEffect(() => {
    fetchKelas();
  });

  const fetchKelas = async () => {
    const kelasSnap = await getDocs(kelasRef);
    const subkelasSnap = await getDocs(subkelasRef);

    setKelasUtama(kelasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setSubkelas(subkelasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const tambahKelas = async () => {
    if (!newKelas) return;
    await addDoc(kelasRef, { nama: newKelas });
    toast({ title: "Kelas utama ditambahkan", status: "success" });
    setNewKelas("");
    fetchKelas();
  };

  const tambahSubkelas = async () => {
    if (!newSubkelas.nama || !newSubkelas.kelasUtamaId) return;
    await addDoc(subkelasRef, newSubkelas);
    toast({ title: "Subkelas ditambahkan", status: "success" });
    setNewSubkelas({ nama: "", kelasUtamaId: "" });
    fetchKelas();
  };

  const hapusKelas = async (id) => {
    await deleteDoc(doc(db, "kelasUtama", id));
    fetchKelas();
  };

  const hapusSubkelas = async (id) => {
    await deleteDoc(doc(db, "subkelas", id));
    fetchKelas();
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Manajemen Kelas</Heading>
      <Box display="flex" gap={10} flexWrap="wrap">
        <Box flex={1}>
          <Heading size="md" mb={2}>Kelas Utama</Heading>
          <Stack direction="row" mb={4}>
            <Input placeholder="Nama kelas (contoh: 7)" value={newKelas} onChange={(e) => setNewKelas(e.target.value)} />
            <Button onClick={tambahKelas} colorScheme="teal">Tambah</Button>
          </Stack>
          <Table>
            <Thead><Tr><Th>Nama</Th><Th w="200px">Aksi</Th></Tr></Thead>
            <Tbody>
              {kelasUtama.map(k => (
                <Tr key={k.id}>
                  <Td>{k.nama}</Td>
                  <Td><Button size="sm" colorScheme="red" onClick={() => hapusKelas(k.id)}>Hapus</Button></Td>
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
            <Thead><Tr><Th>Subkelas</Th><Th>Kelas Utama</Th><Th>Aksi</Th></Tr></Thead>
            <Tbody>
              {subkelas.map(s => (
                <Tr key={s.id}>
                  <Td>{s.nama}</Td>
                  <Td>{kelasUtama.find(k => k.id === s.kelasUtamaId)?.nama}</Td>
                  <Td><Button size="sm" colorScheme="red" onClick={() => hapusSubkelas(s.id)}>Hapus</Button></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}
