import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Tag,
  IconButton, Tooltip
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { AiOutlineEye } from 'react-icons/ai';
import { BsArchive } from "react-icons/bs";
import { useAuth } from "../../context/AuthContext";

export default function RekapNilai() {
  const [ujianList, setUjianList] = useState([]);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchUjian();
  }, []);

  const fetchUjian = async () => {
    const snap = await getDocs(collection(db, "ujianAktif"));
    const now = new Date();
    let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u =>  (!u.aktif || u.selesai.toDate() < now) && !u.arsip);

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

  const arsipkanRekap = async (id) => {
    if (!window.confirm("Yakin ingin mengarsipkan rekap nilai ini?")) return;
    await updateDoc(doc(db, "ujianAktif", id), {
      arsip: true
    });
    toast({ title: "Rekap nilai diarsipkan", status: "info" });
    fetchUjian();
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Rekap Nilai Ujian</Heading>

      <Table>
        <Thead>
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
              <Td>{u.kelas.join(", ")}</Td>
              <Td>
                {format(u.mulai.toDate(), "dd/MM/yyyy HH:mm")} - <br />
                {format(u.selesai.toDate(), "dd/MM/yyyy HH:mm")}
              </Td>
              <Td>{u.jumlahSiswa}</Td>
              <Td>
                <Tooltip label="Lihat Rekap Nilai">
                  <IconButton
                    icon={<AiOutlineEye />}
                    size="sm"
                    colorScheme="blue"
                    as={Link}
                    to={`${u.id}`}
                    mr={2}
                  />
                </Tooltip>
                <Tooltip label="Arsipkan Rekap">
                  <IconButton
                    icon={<BsArchive />}
                    size="sm"
                    colorScheme="orange"
                    onClick={() => arsipkanRekap(u.id)}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
