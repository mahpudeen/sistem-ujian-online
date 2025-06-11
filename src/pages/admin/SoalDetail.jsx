import {
  Box, Heading, Text, Button, Table, Thead, Tbody, Tr, Th, Td,
  useToast, Stack, Input, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure,
  Textarea, Tooltip, IconButton, Flex
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { useParams } from "react-router-dom";
import {
  doc, getDoc, collection, getDocs, addDoc, Timestamp, setDoc, deleteDoc
} from "firebase/firestore";
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
    if (window.confirm("Yakin hapus pertanyaan?")) {
      await deleteDoc(doc(db, "soal", id, "pertanyaan", ids));
      fetchPertanyaan();
      toast({ title: "Pertanyaan dihapus", status: "info" });
    }
  };

  
  return (
    <Box p={6}>
      <Heading mb={2}>Detail Soal</Heading>
      {soal && (
        <Text fontSize="lg" mb={4}>
          <strong>{soal.nama}</strong> - {soal.kode}
        </Text>
      )}

      <Button colorScheme="teal" onClick={onOpen} mb={4}>Tambah Pertanyaan</Button>

      <Table>
        <Thead>
          <Tr>
            <Th>No</Th>
            <Th width="85%">Pertanyaan</Th>
            <Th textAlign="center">Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {pertanyaanList.map((p, i) => (
            <Tr key={p.id}>
              <Td>{i + 1}</Td>
              <Td>
                <Text mb={2} fontWeight="bold">{p.teks}</Text>
                <Box>
                  {p.opsi?.map((o, j) => (
                    <Text key={j} color={j === p.jawabanBenar ? "green.500" : "gray.700"}>
                      {String.fromCharCode(65 + j)}. {o}
                    </Text>
                  ))}
                </Box>
              </Td>
              <Td textAlign="center">
                <Flex gap={2} flexWrap="wrap">
                  <Tooltip label="Edit Soal">
                    <IconButton
                      icon={<AiFillEdit />}
                      size="sm"
                      colorScheme="green"
                      onClick={() => {
                        setEditId(p.id);
                        setNewPertanyaan(p.teks);
                        setOpsiList(p.opsi || ["", "", "", ""]);
                        setJawabanBenar(p.jawabanBenar);
                        onOpen();
                      }}
                    />
                  </Tooltip>
                  <Tooltip label="Delete Soal">
                    <IconButton
                      icon={<AiFillDelete />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(p.id)}
                    />
                  </Tooltip>
                </Flex>
              </Td>

            </Tr>
          ))}
        </Tbody>
      </Table>


      {/* Modal Tambah Pertanyaan */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Pertanyaan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Textarea
                placeholder="Teks pertanyaan"
                value={newPertanyaan}
                onChange={(e) => setNewPertanyaan(e.target.value)}
              />
              <Box>
                <Text fontWeight="bold">Opsi Jawaban:</Text>
                {opsiList.map((opsi, i) => (
                  <Stack key={i} direction="row" align="center" mt={2}>
                    <Input
                      placeholder={`Opsi ${i + 1}`}
                      value={opsi}
                      onChange={(e) => {
                        const newOpsi = [...opsiList];
                        newOpsi[i] = e.target.value;
                        setOpsiList(newOpsi);
                      }}
                    />
                    <input
                      type="radio"
                      name="jawaban"
                      value={i}
                      onChange={() => setJawabanBenar(i)}
                      checked={jawabanBenar === i}
                    />
                    <Text>Benar</Text>
                    {opsiList.length > 4 && (
                      <Button size="sm" colorScheme="red" onClick={() => {
                        const newList = opsiList.filter((_, idx) => idx !== i);
                        setOpsiList(newList);
                        if (jawabanBenar === i) setJawabanBenar(null);
                        else if (jawabanBenar > i) setJawabanBenar(jawabanBenar - 1);
                      }}>
                        X
                      </Button>
                    )}
                  </Stack>
                ))}
              </Box>
              <Button
                size="sm"
                mt={2}
                onClick={() => {
                  if (opsiList.length < 5) setOpsiList([...opsiList, ""]);
                }}
                isDisabled={opsiList.length >= 5}
              >
                Tambah Opsi
              </Button>

            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSimpan}>
              {editId ? "Update" : "Simpan"}
            </Button>
            <Button onClick={() => {
              setEditId(null);
              onClose();
            }} ml={3}>Batal</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
