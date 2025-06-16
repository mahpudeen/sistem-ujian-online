import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input, Modal,
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
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import ConfirmDialog from 'components/ConfirmDialog';
import {
  addDoc,
  collection,
  deleteDoc,
  doc, getDoc,
  getDocs,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";

export default function SoalDetail() {
  const { id } = useParams();
  const [soal, setSoal] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [newPertanyaan, setNewPertanyaan] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [opsiList, setOpsiList] = useState(["", "", "", ""]);
  const [jawabanBenar, setJawabanBenar] = useState(null);
  const [editId, setEditId] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedId, setSelectedId] = useState(null);


  useEffect(() => {
    fetchSoal();
    fetchPertanyaan();
  });

  const fetchSoal = async () => {
    const docRef = doc(db, "soal", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) setSoal(docSnap.data());
  };

  const fetchPertanyaan = async () => {
    const colRef = collection(db, "soal", id, "pertanyaan");
    const snap = await getDocs(colRef);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setPertanyaanList(list);
  };

  const handleSimpan = async () => {
    if (
      !newPertanyaan.trim() ||
      jawabanBenar === null ||
      opsiList.length < 4 ||
      opsiList.some(o => o.trim() === "")
    ) {
      toast({ title: "Pertanyaan, jawaban & minimal 4 opsi wajib diisi", status: "warning" });
      return;
    }

    const data = {
      teks: newPertanyaan,
      opsi: opsiList,
      jawabanBenar,
      createdAt: Timestamp.now()
    };

    try {
      if (editId) {
        await setDoc(doc(db, "soal", id, "pertanyaan", editId), data);
        toast({ title: "Pertanyaan diperbarui", status: "info" });
      } else {
        await addDoc(collection(db, "soal", id, "pertanyaan"), data);
        toast({ title: "Pertanyaan ditambahkan", status: "success" });
      }

      // Reset
      setNewPertanyaan("");
      setOpsiList(["", "", "", ""]);
      setJawabanBenar(null);
      setEditId(null);
      onClose();
      fetchPertanyaan();

    } catch (err) {
      toast({ title: "Gagal simpan", description: err.message, status: "error" });
    }
  };

  const handleDelete = async (ids) => {
    await deleteDoc(doc(db, "soal", id, "pertanyaan", ids));
    fetchPertanyaan();
    toast({ title: "Pertanyaan dihapus", status: "info" });
  };


  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={2} fontSize={{ base: 'xl', md: '2xl' }}>Detail Soal</Heading>

      {soal && (
        <Text fontSize="md" mb={4}>
          <strong>{soal.nama}</strong> - {soal.kode}
        </Text>
      )}

      <Button colorScheme="teal" onClick={onOpen} mb={4}>
        Tambah Pertanyaan
      </Button>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>No</Th>
              <Th w="85%">Pertanyaan</Th>
              <Th textAlign="center">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pertanyaanList.map((p, i) => (
              <Tr key={p.id}>
                <Td>{i + 1}</Td>
                <Td>
                  <Text mb={2} fontWeight="semibold">{p.teks}</Text>
                  <Box>
                    {p.opsi?.map((o, j) => (
                      <Text
                        key={j}
                        color={j === p.jawabanBenar ? 'green.500' : 'gray.700'}
                      >
                        {String.fromCharCode(65 + j)}. {o}
                      </Text>
                    ))}
                  </Box>
                </Td>
                <Td textAlign="center">
                  <Flex gap={2} flexWrap="wrap" justify="center">
                    <Tooltip label="Edit Soal">
                      <IconButton
                        icon={<AiFillEdit />}
                        size="sm"
                        colorScheme="green"
                        onClick={() => {
                          setEditId(p.id)
                          setNewPertanyaan(p.teks)
                          setOpsiList(p.opsi || ["", "", "", ""])
                          setJawabanBenar(p.jawabanBenar)
                          onOpen()
                        }}
                        aria-label="Edit"
                      />
                    </Tooltip>
                    <Tooltip label="Delete Soal">
                      <IconButton
                        icon={<AiFillDelete />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => {
                          setSelectedId(p.id);
                          onDeleteOpen();
                        }}
                        aria-label="Delete"
                      />
                    </Tooltip>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal Tambah/Edit Pertanyaan */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Textarea
                placeholder="Teks pertanyaan"
                value={newPertanyaan}
                onChange={(e) => setNewPertanyaan(e.target.value)}
                size="sm"
              />
              <Box>
                <Text fontWeight="bold" mb={1}>Opsi Jawaban:</Text>
                {opsiList.map((opsi, i) => (
                  <Flex key={i} gap={2} align="center" mt={2}>
                    <Input
                      placeholder={`Opsi ${i + 1}`}
                      value={opsi}
                      size="sm"
                      onChange={(e) => {
                        const newOpsi = [...opsiList]
                        newOpsi[i] = e.target.value
                        setOpsiList(newOpsi)
                      }}
                    />
                    <input
                      type="radio"
                      name="jawaban"
                      value={i}
                      onChange={() => setJawabanBenar(i)}
                      checked={jawabanBenar === i}
                    />
                    <Text fontSize="sm">Benar</Text>
                    {opsiList.length > 4 && (
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => {
                          const newList = opsiList.filter((_, idx) => idx !== i)
                          setOpsiList(newList)
                          if (jawabanBenar === i) setJawabanBenar(null)
                          else if (jawabanBenar > i) setJawabanBenar(jawabanBenar - 1)
                        }}
                      >
                        X
                      </Button>
                    )}
                  </Flex>
                ))}
              </Box>
              <Button
                size="sm"
                onClick={() => {
                  if (opsiList.length < 5) setOpsiList([...opsiList, ""])
                }}
                isDisabled={opsiList.length >= 5}
              >
                Tambah Opsi
              </Button>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSimpan}>
              {editId ? 'Update' : 'Simpan'}
            </Button>
            <Button onClick={() => {
              setEditId(null)
              onClose()
            }} ml={3}>
              Batal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={() => {
          handleDelete(selectedId);
          onDeleteClose();
          setSelectedId(null);
        }}
        title="Hapus Pertanyaan"
        description="Pertanyaan akan dihapus secara permanen. Lanjutkan?"
      />

    </Box>

  );
}
