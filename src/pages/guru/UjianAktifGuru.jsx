import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Tag,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Input, CheckboxGroup, Checkbox, Stack, Text,
  IconButton, Tooltip
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { format, formatISO } from "date-fns";
import { AiFillEdit, AiOutlineStop, AiOutlineDelete } from 'react-icons/ai';
import { useAuth } from "../../context/AuthContext";

export default function UjianAktifGuru() {
  const { user } = useAuth();

  const [ujianAktif, setUjianAktif] = useState([]);
  const [ujianRiwayat, setUjianRiwayat] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [kelasTerpilih, setKelasTerpilih] = useState([]);
  const [editMulai, setEditMulai] = useState("");
  const [editSelesai, setEditSelesai] = useState("");

  const toast = useToast();

  useEffect(() => {
    fetchUjian();
  }, []);

  const fetchUjian = async () => {
    const snap = await getDocs(collection(db, "ujianAktif"));
    let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (user.role === "guru") {
      list = list.filter(u => user.mapel_name?.includes(u.mapel));
    }

    const now = new Date();
    const aktif = list.filter(u => u.aktif && now <= u.selesai.toDate() && !u.arsip);
    const riwayat = list.filter(u => !u.aktif || now > u.selesai.toDate() && !u.arsip);

    setUjianAktif(aktif);
    setUjianRiwayat(riwayat);

    const kelasSnap = await getDocs(collection(db, "subkelas"));
    let kelasArr = kelasSnap.docs.map(d => d.data().nama);

    if (user.role === "guru") {
      kelasArr = kelasArr.filter(k => user.subkelas_name?.includes(k));
    }

    setKelasList(kelasArr.sort());
  };

  const nonaktifkanUjian = async (id) => {
    const confirm = window.confirm("Yakin ingin nonaktifkan ujian ini?");
    if (!confirm) return;

    await updateDoc(doc(db, "ujianAktif", id), {
      aktif: false
    });

    toast({ title: "Ujian dinonaktifkan", status: "info" });
    fetchUjian();
  };

  const hapusUjian = async (id) => {
    if (!window.confirm("Yakin ingin menghapus riwayat ujian ini?")) return;
    await deleteDoc(doc(db, "ujianAktif", id));
    toast({ title: "Ujian dihapus", status: "info" });
    fetchUjian();
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Daftar Ujian Aktif</Heading>

      <Table>
        <Thead>
          <Tr>
            <Th>Kode</Th>
            <Th>Nama Soal</Th>
            <Th>Kelas</Th>
            <Th>Waktu</Th>
            <Th>Status</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ujianAktif.map((ujian) => (
            <Tr key={ujian.id}>
              <Td>{ujian.soalKode}</Td>
              <Td>{ujian.soalNama}</Td>
              <Td>{ujian.kelas.join(", ")}</Td>
              <Td>
                {format(ujian.mulai.toDate(), "dd/MM/yyyy HH:mm")} -<br />
                {format(ujian.selesai.toDate(), "dd/MM/yyyy HH:mm")}
              </Td>
              <Td>
                {ujian.aktif ? <Tag colorScheme="green">Aktif</Tag> : <Tag colorScheme="gray">Nonaktif</Tag>}
              </Td>
              <Td>
                {ujian.aktif && (
                  <>
                    <Tooltip label="Edit Ujian">
                      <IconButton
                        icon={<AiFillEdit />}
                        size="sm"
                        colorScheme="yellow"
                        mr={2}
                        onClick={() => {
                          setEditData(ujian);
                          setEditMulai(formatISO(ujian.mulai.toDate()).slice(0, 16));
                          setEditSelesai(formatISO(ujian.selesai.toDate()).slice(0, 16));
                          setKelasTerpilih(ujian.kelas);
                          setIsEditOpen(true);
                        }}
                      />
                    </Tooltip>
                  </>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Heading my={4} size={18} mt={6}>Riwayat Ujian</Heading>

      <Table>
        <Thead>
          <Tr>
            <Th>Kode</Th>
            <Th>Nama Soal</Th>
            <Th>Kelas</Th>
            <Th>Waktu</Th>
            <Th>Status</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ujianRiwayat.map(u => (
            <Tr key={u.id}>
              <Td>{u.soalKode}</Td>
              <Td>{u.soalNama}</Td>
              <Td>{u.kelas.join(", ")}</Td>
              <Td>
                {format(u.mulai.toDate(), "dd/MM/yyyy HH:mm")} -<br />
                {format(u.selesai.toDate(), "dd/MM/yyyy HH:mm")}
              </Td>
              <Td>
                <Tag colorScheme="gray">Selesai</Tag>
              </Td>
              <Td>
                <Tooltip label="Edit Ujian">
                  <IconButton
                    icon={<AiFillEdit />}
                    size="sm"
                    colorScheme="yellow"
                    mr={2}
                    onClick={() => {
                      setEditData(ujian);
                      setEditMulai(formatISO(ujian.mulai.toDate()).slice(0, 16));
                      setEditSelesai(formatISO(ujian.selesai.toDate()).slice(0, 16));
                      setKelasTerpilih(ujian.kelas);
                      setIsEditOpen(true);
                    }}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Jadwal Ujian</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Box>
                <Text fontWeight="bold">Kelas</Text>
                <CheckboxGroup value={kelasTerpilih} onChange={setKelasTerpilih}>
                  <Stack direction="row" wrap="wrap">
                    {kelasList.map((k) => (
                      <Checkbox key={k} value={k}>{k}</Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </Box>
              <Box>
                <Text fontWeight="bold">Tanggal & Jam Mulai</Text>
                <Input
                  type="datetime-local"
                  value={editMulai}
                  onChange={(e) => setEditMulai(e.target.value)}
                />
              </Box>
              <Box>
                <Text fontWeight="bold">Tanggal & Jam Selesai</Text>
                <Input
                  type="datetime-local"
                  value={editSelesai}
                  onChange={(e) => setEditSelesai(e.target.value)}
                />
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={async () => {
                const durasi = (new Date(editSelesai) - new Date(editMulai)) / 60000;
                await updateDoc(doc(db, "ujianAktif", editData.id), {
                  mulai: Timestamp.fromDate(new Date(editMulai)),
                  selesai: Timestamp.fromDate(new Date(editSelesai)),
                  kelas: kelasTerpilih,
                  durasiMenit: durasi
                });
                toast({ title: "Jadwal diperbarui", status: "success" });
                setIsEditOpen(false);
                fetchUjian();
              }}
            >
              Simpan
            </Button>
            <Button onClick={() => setIsEditOpen(false)} ml={3}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
