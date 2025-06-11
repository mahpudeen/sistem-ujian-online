import {
  Box, Heading, Input, Button, Table, Thead, Tbody,
  Tr, Th, Td, Stack, useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

export default function ManajemenMapel() {
  const [mapelList, setMapelList] = useState([]);
  const [formData, setFormData] = useState({ kodeMapel: "", nama: "" });
  const toast = useToast();

  const mapelRef = collection(db, "mapel");

  useEffect(() => {
    fetchMapel();
  });

  const fetchMapel = async () => {
    const snapshot = await getDocs(mapelRef);
    setMapelList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.kodeMapel || !formData.nama) return;
    await addDoc(mapelRef, formData);
    toast({ title: "Mapel ditambahkan", status: "success" });
    setFormData({ kodeMapel: "", nama: "" });
    fetchMapel();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus mapel ini?")) return;
    await deleteDoc(doc(db, "mapel", id));
    fetchMapel();
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Manajemen Mapel</Heading>
      <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={4}>
        <Input
          name="kodeMapel"
          placeholder="Kode (contoh: MAT)"
          value={formData.kodeMapel}
          onChange={handleChange}
        />
        <Input
          name="nama"
          placeholder="Nama Mapel (contoh: Matematika)"
          value={formData.nama}
          onChange={handleChange}
        />
        <Button px={10} colorScheme="teal" onClick={handleSubmit}>Tambah</Button>
      </Stack>

      <Table>
        <Thead>
          <Tr>
            <Th>Kode</Th>
            <Th>Nama</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mapelList.map((mapel) => (
            <Tr key={mapel.id}>
              <Td>{mapel.kodeMapel}</Td>
              <Td>{mapel.nama}</Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(mapel.id)}
                >
                  Hapus
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
