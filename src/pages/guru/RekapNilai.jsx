import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Tag,
  IconButton, Tooltip, Stack, useDisclosure
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { AiOutlineEye } from 'react-icons/ai';
import { BsArchive } from "react-icons/bs";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from 'components/ConfirmDialog'; // pastikan ini diimpor
import { logAudit } from 'utilities/logAudit'; // pastikan ini tersedia


export default function RekapNilai() {
  const [ujianList, setUjianList] = useState([]);
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchUjian();
  }, []);

  const fetchUjian = async () => {
    const snap = await getDocs(collection(db, "ujianAktif"));
    const now = new Date();
    let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => (!u.aktif || u.selesai.toDate() < now) && !u.arsip);

    if (user?.role === "guru") {
      list = list.filter(u => user.mapel_name?.includes(u.mapel));
    }

    const jawabanSnap = await getDocs(collection(db, "jawaban"));
    const countMap = {};
    jawabanSnap.docs.forEach(doc => {
      const data = doc.data();
      if (!countMap[data.ujianId]) countMap[data.ujianId] = 0;
      countMap[data.ujianId]++;
    });

    list = list.map(u => ({ ...u, jumlahSiswa: countMap[u.id] || 0 }));

    setUjianList(list);
  };

  const handleConfirmArsip = async () => {
    await updateDoc(doc(db, "ujianAktif", selectedId), { arsip: true });

    await logAudit({
      userId: user.uid,
      nama: user.nama,
      role: user.role,
      aksi: "Arsip",
      entitas: "Rekap Nilai Ujian",
      entitasId: selectedId,
      detail: `Rekap nilai ujian ${selectedId} diarsipkan`
    });

    toast({ title: "Rekap nilai diarsipkan", status: "info" });
    fetchUjian();
    setSelectedId(null);
    onClose();
  };

  return (
    <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Heading mb={4} fontSize={{ base: 'xl', md: '2xl' }}>
        Rekap Nilai Ujian
      </Heading>

      <Box overflowX="auto" borderRadius="md">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Kode</Th>
              <Th>Nama Soal</Th>
              <Th>Kelas</Th>
              <Th>Waktu</Th>
              <Th>Jumlah Siswa</Th>
              <Th>Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ujianList.map((u) => (
              <Tr key={u.id}>
                <Td>{u.soalKode}</Td>
                <Td>{u.soalNama}</Td>
                <Td>{u.kelas.join(', ')}</Td>
                <Td whiteSpace="nowrap">
                  {format(u.mulai.toDate(), 'dd/MM/yyyy HH:mm')} -<br />
                  {format(u.selesai.toDate(), 'dd/MM/yyyy HH:mm')}
                </Td>
                <Td>{u.jumlahSiswa}</Td>
                <Td>
                  <Stack direction="row" spacing={1}>
                    <Tooltip label="Lihat Rekap Nilai">
                      <IconButton
                        icon={<AiOutlineEye />}
                        size="sm"
                        colorScheme="blue"
                        as={Link}
                        to={`${u.id}`}
                        aria-label="Lihat Rekap"
                      />
                    </Tooltip>
                    <IconButton
                      icon={<BsArchive />}
                      size="sm"
                      colorScheme="orange"
                      onClick={() => {
                        setSelectedId(u.id);
                        onOpen();
                      }}
                      aria-label="Arsipkan Rekap"
                    />
                  </Stack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmArsip}
        title="Arsipkan Rekap Nilai"
        description="Rekap nilai akan dipindahkan ke arsip. Lanjutkan?"
      />

    </Box>
  );
}
