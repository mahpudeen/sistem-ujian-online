import {
  Box, Heading, Text, Stack, Tag, Button, Divider
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { format, formatDistanceToNowStrict } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function DashboardSiswa() {
  const { user } = useAuth();
  const [ujianList, setUjianList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.kelas) {
      fetchUjian();
    }
  }, [user]);

  const fetchUjian = async () => {
    const now = new Date();
    const snap = await getDocs(collection(db, "ujianAktif"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filtered = list.filter(u => {
      const mulai = u.mulai.toDate();
      const selesai = u.selesai.toDate();
      return u.aktif && u.kelas.includes(user.kelas) && now >= mulai && now <= selesai;
    });

    const finalList = await Promise.all(filtered.map(async (ujian) => {
      const soalDoc = await getDoc(doc(db, "soal", ujian.soalId));
      const soalData = soalDoc.exists() ? soalDoc.data() : {};
      return {
        ...ujian,
        soalNama: soalData.nama || "Soal Tidak Ditemukan",
        mapel: soalData.mapelNama || "-",
      };
    }));

    setUjianList(finalList);
  };

  return (
    <Box p={4}>
      <Heading size="lg" mb={4} textAlign="center">Ujian Aktif</Heading>

      {ujianList.length === 0 ? (
        <Text textAlign="center">Tidak ada ujian aktif saat ini.</Text>
      ) : (
        <Stack spacing={4}>
          {ujianList.map((ujian) => {
            const selesai = ujian.selesai.toDate();
            const waktuTersisa = formatDistanceToNowStrict(selesai, { addSuffix: true });

            return (
              <Box key={ujian.id} p={4} borderWidth="1px" borderRadius="md" shadow="sm">
                <Stack spacing={2}>
                  <Text fontWeight="bold" fontSize="md">{ujian.mapel}</Text>
                  <Text fontSize="sm">Soal: <strong>{ujian.soalNama}</strong></Text>
                  <Text fontSize="sm">Kode: <Tag>{ujian.soalKode}</Tag></Text>
                  <Divider />
                  <Text fontSize="sm">
                    Jadwal: {format(ujian.mulai.toDate(), "dd/MM/yyyy HH:mm")} – {format(selesai, "HH:mm")}
                  </Text>
                  <Text fontSize="sm">Durasi: {ujian.durasiMenit} menit</Text>
                  <Text fontSize="sm" color="teal.600">Tersisa: {waktuTersisa}</Text>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    onClick={() => navigate(`/siswa/ujian/${ujian.id}`)}
                  >
                    Mulai Ujian
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
