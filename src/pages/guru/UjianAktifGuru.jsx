import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
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
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  Wrap, WrapItem
} from "@chakra-ui/react";
import { format, formatISO } from "date-fns";
import { collection, deleteDoc, doc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiFillEdit } from 'react-icons/ai';
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";

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

  return (
    <><Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Daftar Ujian Aktif
      </Heading>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th w="15%">Kode</Th>
              <Th w="30%">Nama Soal</Th>
              <Th w="10%">Kelas</Th>
              <Th w="10%">Waktu</Th>
              <Th w="10%">Status</Th>
              <Th w="10%">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ujianAktif.map((ujian) => (
              <Tr key={ujian.id}>
                <Td>{ujian.soalKode}</Td>
                <Td>{ujian.soalNama}</Td>
                <Td>{ujian.kelas.join(', ')}</Td>
                <Td whiteSpace="nowrap">
                  {format(ujian.mulai.toDate(), 'dd/MM/yyyy HH:mm')} -<br />
                  {format(ujian.selesai.toDate(), 'dd/MM/yyyy HH:mm')}
                </Td>
                <Td>
                  {ujian.aktif ? (
                    <Tag colorScheme="green">Aktif</Tag>
                  ) : (
                    <Tag colorScheme="gray">Nonaktif</Tag>
                  )}
                </Td>
                <Td>
                  {ujian.aktif && (
                    <Tooltip label="Edit Ujian">
                      <IconButton
                        icon={<AiFillEdit />}
                        size="sm"
                        colorScheme="yellow"
                        onClick={() => {
                          setEditData(ujian);
                          setEditMulai(formatISO(ujian.mulai.toDate()).slice(0, 16));
                          setEditSelesai(formatISO(ujian.selesai.toDate()).slice(0, 16));
                          setKelasTerpilih(ujian.kelas);
                          setIsEditOpen(true);
                        }}
                        aria-label="Edit" />
                    </Tooltip>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
      <Box bg="white" borderRadius="xl" mt={4} p={{ base: 4, md: 6 }} boxShadow="sm">
        <Heading fontSize="lg" mb={4}>
          Riwayat Ujian
        </Heading>

        <Box overflowX="auto" borderRadius="md">
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th w="15%">Kode</Th>
                <Th w="30%">Nama Soal</Th>
                <Th w="10%">Kelas</Th>
                <Th w="10%">Waktu</Th>
                <Th w="10%">Status</Th>
                <Th w="10%">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {ujianRiwayat.map((u) => (
                <Tr key={u.id}>
                  <Td>{u.soalKode}</Td>
                  <Td>{u.soalNama}</Td>
                  <Td>{u.kelas.join(', ')}</Td>
                  <Td whiteSpace="nowrap">
                    {format(u.mulai.toDate(), 'dd/MM/yyyy HH:mm')} -<br />
                    {format(u.selesai.toDate(), 'dd/MM/yyyy HH:mm')}
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
                        onClick={() => {
                          setEditData(u);
                          setEditMulai(formatISO(u.mulai.toDate()).slice(0, 16));
                          setEditSelesai(formatISO(u.selesai.toDate()).slice(0, 16));
                          setKelasTerpilih(u.kelas);
                          setIsEditOpen(true);
                        }}
                        aria-label="Edit" />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Jadwal Ujian</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Kelas
                </Text>
                <CheckboxGroup value={kelasTerpilih} onChange={setKelasTerpilih}>
                  <Wrap spacing={4}>
                    {kelasList.map((k) => (
                      <WrapItem key={k}>
                        <Checkbox value={k}>{k}</Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Tanggal & Jam Mulai
                </Text>
                <Input
                  type="datetime-local"
                  value={editMulai}
                  onChange={(e) => setEditMulai(e.target.value)}
                  size="sm" />
              </Box>
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Tanggal & Jam Selesai
                </Text>
                <Input
                  type="datetime-local"
                  value={editSelesai}
                  onChange={(e) => setEditSelesai(e.target.value)}
                  size="sm" />
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={async () => {
                const durasi = (new Date(editSelesai) - new Date(editMulai)) / 60000;
                await updateDoc(doc(db, 'ujianAktif', editData.id), {
                  mulai: Timestamp.fromDate(new Date(editMulai)),
                  selesai: Timestamp.fromDate(new Date(editSelesai)),
                  kelas: kelasTerpilih,
                  durasiMenit: durasi
                });
                toast({ title: 'Jadwal diperbarui', status: 'success' });
                setIsEditOpen(false);
                fetchUjian();
              }}
            >
              Simpan
            </Button>
            <Button onClick={() => setIsEditOpen(false)} ml={3}>
              Batal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
