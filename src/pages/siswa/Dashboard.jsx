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
  const [ujianAkanDatang, setUjianAkanDatang] = useState([]);
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

    const aktif = list.filter(u =>
      u.aktif &&
      u.kelas.includes(user.kelas) &&
      now >= u.mulai.toDate() &&
      now <= u.selesai.toDate()
    );

    const upcoming = list.filter(u =>
      u.aktif &&
      u.kelas.includes(user.kelas) &&
      now < u.mulai.toDate()
    );

    const withSoal = async (arr) => {
      return await Promise.all(arr.map(async (ujian) => {
        const soalDoc = await getDoc(doc(db, "soal", ujian.soalId));
        const soalData = soalDoc.exists() ? soalDoc.data() : {};
        const jawabanDoc = await getDoc(doc(db, "jawaban", `${user.uid}_${ujian.id}`));
        const jawabanData = jawabanDoc.exists() ? jawabanDoc.data() : null;
        const sudahSubmit = jawabanData?.waktuSubmit;

        return {
          ...ujian,
          soalNama: soalData.nama || "Soal Tidak Ditemukan",
          mapel: soalData.mapelNama || "-",
          sudahSubmit,
          sedangMengerjakan: jawabanDoc.exists() && !sudahSubmit,
        };
      }));
    };

    const finalAktif = await withSoal(aktif);
    const finalUpcoming = await withSoal(upcoming);

    setUjianList(finalAktif);
    setUjianAkanDatang(finalUpcoming);
  };


  return (
    <Box>
      <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm">
        <Heading size="lg" mb={4} textAlign="center">Ujian Aktif</Heading>

        {ujianList.length === 0 ? (
          <Text textAlign="center">Tidak ada ujian aktif saat ini.</Text>
        ) : (
          <Stack spacing={4}>
            {ujianList.map((ujian) => {
              const selesai = ujian.selesai.toDate();
              const waktuTersisa = formatDistanceToNowStrict(selesai, { addSuffix: true });

              return (
                <Box key={ujian.id} p={4} borderWidth="1px" borderRadius="md" shadow="md">
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
                    {ujian.sudahSubmit ? (
                      <Text fontSize="sm" color="green.500">Sudah Submit</Text>
                    ) : (
                      <Button
                        colorScheme={ujian.sedangMengerjakan ? "gray" : "teal"}
                        size="sm"
                        onClick={() => navigate(`/siswa/ujian/${ujian.id}`)}
                      >
                        {ujian.sedangMengerjakan ? "Lanjutkan Ujian" : "Mulai Ujian"}
                      </Button>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
      <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm" mt={6}>
        <Heading size="lg" mb={4} textAlign="center">Ujian Akan Datang</Heading>

        {ujianAkanDatang.length === 0 ? (
          <Text textAlign="center">Tidak ada ujian terjadwal.</Text>
        ) : (
          <Stack spacing={4}>
            {ujianAkanDatang.map((ujian) => (
              <Box key={ujian.id} p={4} borderWidth="1px" borderRadius="md" shadow="md">
                <Stack spacing={2}>
                  <Text fontWeight="bold" fontSize="md">{ujian.mapel}</Text>
                  <Text fontSize="sm">Soal: <strong>{ujian.soalNama}</strong></Text>
                  <Text fontSize="sm">Kode: <Tag>{ujian.soalKode}</Tag></Text>
                  <Divider />
                  <Text fontSize="sm">
                    Jadwal: {format(ujian.mulai.toDate(), "dd/MM/yyyy HH:mm")} – {format(ujian.selesai.toDate(), "HH:mm")}
                  </Text>
                  <Text fontSize="sm">Durasi: {ujian.durasiMenit} menit</Text>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
